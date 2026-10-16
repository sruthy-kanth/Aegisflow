import mongoose from 'mongoose';
import axios from 'axios';
import { env } from '../config/env.js';
import { Sensor } from '../models/Sensor.js';
import { Delivery } from '../models/Delivery.js';
import { Region } from '../models/Region.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { recordAuditLog } from '../middleware/audit.js';

// In-memory job execution tracker for the risk engine and schedulers
export const systemJobTracker = {
  riskEngine: {
    lastRunAt: new Date(),
    status: 'success',
    durationMs: 420,
    regionsProcessed: 1,
    notes: 'Open-Meteo 72h observations and 24h forecast merged'
  },
  escalationCheck: {
    lastRunAt: new Date(),
    status: 'idle',
    pendingProposalsScanned: 0
  },
  sensorHealth: {
    lastRunAt: new Date(),
    status: 'success',
    activeSensors: 0,
    silentSensors: 0
  }
};

// Current provider config state (can be switched dynamically in-memory/DB)
export const activeProviderSettings = {
  smsProvider: env.SMS_PROVIDER,
  voiceProvider: env.VOICE_PROVIDER,
  buzzerGatewayUrl: env.BUZZER_GATEWAY_URL,
  twilioConfigured: Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN),
  msg91Configured: Boolean(env.MSG91_AUTH_KEY),
  openMeteoEndpoint: env.OPEN_METEO_BASE_URL
};

export async function getSystemHealth(req, res, next) {
  try {
    const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Test Open-Meteo feed connectivity (quick ping to Wayanad coords)
    let weatherFeedStatus = 'reachable';
    let weatherLatencyMs = null;
    try {
      const startTime = Date.now();
      await axios.get(`${env.OPEN_METEO_BASE_URL}?latitude=11.60&longitude=76.08&hourly=precipitation&forecast_days=1`, {
        timeout: 4000
      });
      weatherLatencyMs = Date.now() - startTime;
    } catch (e) {
      weatherFeedStatus = 'degraded_or_offline';
    }

    // Sensor counts
    const [totalSensors, activeSensors, silentSensors, degradedSensors] = await Promise.all([
      Sensor.countDocuments(),
      Sensor.countDocuments({ status: 'active' }),
      Sensor.countDocuments({ status: 'silent' }),
      Sensor.countDocuments({ status: 'degraded' })
    ]);

    // Delivery stats across all regions
    const [deliveriesQueued, deliveriesSent, deliveriesDelivered, deliveriesFailed] = await Promise.all([
      Delivery.countDocuments({ status: 'queued' }),
      Delivery.countDocuments({ status: 'sent' }),
      Delivery.countDocuments({ status: 'delivered' }),
      Delivery.countDocuments({ status: 'failed' })
    ]);

    return sendSuccess(res, {
      system: {
        serverTime: new Date(),
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        environment: env.NODE_ENV
      },
      database: {
        status: dbState,
        dbName: mongoose.connection.name,
        host: mongoose.connection.host
      },
      externalFeeds: {
        openMeteo: {
          status: weatherFeedStatus,
          latencyMs: weatherLatencyMs,
          endpoint: env.OPEN_METEO_BASE_URL
        }
      },
      jobs: systemJobTracker,
      sensors: {
        total: totalSensors,
        active: activeSensors,
        silent: silentSensors,
        degraded: degradedSensors
      },
      messaging: {
        activeSettings: activeProviderSettings,
        stats: {
          queued: deliveriesQueued,
          sent: deliveriesSent,
          delivered: deliveriesDelivered,
          failed: deliveriesFailed
        }
      }
    }, 'System health metrics retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getProviderSettings(req, res, next) {
  try {
    return sendSuccess(res, { settings: activeProviderSettings }, 'Provider settings');
  } catch (error) {
    next(error);
  }
}

export async function updateProviderSettings(req, res, next) {
  try {
    const { smsProvider, voiceProvider, buzzerGatewayUrl } = req.body;

    const beforeState = { ...activeProviderSettings };

    if (smsProvider) activeProviderSettings.smsProvider = smsProvider;
    if (voiceProvider) activeProviderSettings.voiceProvider = voiceProvider;
    if (buzzerGatewayUrl) activeProviderSettings.buzzerGatewayUrl = buzzerGatewayUrl;

    await recordAuditLog({
      actor: req.user,
      action: 'MESSAGING_PROVIDER_SETTINGS_UPDATED',
      entity: 'SystemConfig',
      entityId: 'global',
      before: beforeState,
      after: activeProviderSettings,
      req
    });

    return sendSuccess(res, { settings: activeProviderSettings }, 'Messaging provider settings updated');
  } catch (error) {
    next(error);
  }
}

// Mock Buzzer Gateway Endpoint for dev and testing
export async function mockBuzzerEndpoint(req, res) {
  return sendSuccess(res, {
    status: 'buzzer_sounded_ok',
    timestamp: new Date(),
    payloadReceived: req.body
  }, 'Simulated physical alarm buzzer triggered successfully');
}
