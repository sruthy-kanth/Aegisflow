import mongoose from 'mongoose';

const thresholdTierSchema = new mongoose.Schema(
  {
    watch: { type: Number, required: true },
    warning: { type: Number, required: true },
    evacuate: { type: Number, required: true }
  },
  { _id: false }
);

const messageTemplateTierSchema = new mongoose.Schema(
  {
    watch: { type: String, required: true },
    warning: { type: String, required: true },
    evacuate: { type: String, required: true }
  },
  { _id: false }
);

const thresholdConfigSchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      required: true,
      default: 1
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    isGlobalDefault: {
      type: Boolean,
      default: false
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      default: null
    },
    // Rainfall cumulative thresholds in millimeters (mm)
    rainfall24h: {
      type: thresholdTierSchema,
      default: () => ({ watch: 65, warning: 115, evacuate: 200 })
    },
    rainfall72h: {
      type: thresholdTierSchema,
      default: () => ({ watch: 120, warning: 180, evacuate: 300 })
    },
    rainfallForecast24h: {
      type: thresholdTierSchema,
      default: () => ({ watch: 70, warning: 125, evacuate: 210 })
    },
    // Soil moisture threshold (percentage saturation 0-100%)
    soilMoisturePercent: {
      type: thresholdTierSchema,
      default: () => ({ watch: 70, warning: 85, evacuate: 95 })
    },
    messageTemplates: {
      en: {
        type: messageTemplateTierSchema,
        default: () => ({
          watch: 'AEGISFLOW ADVISORY: Heightened rainfall detected in your zone. Stay alert and keep emergency contacts ready. Details: {{link}}',
          warning: 'AEGISFLOW WARNING: Heavy rain risk crossing critical safety limits in your zone. Check evacuation routes and prepare supplies. Details: {{link}}',
          evacuate: 'AEGISFLOW EVACUATION ORDER: Severe flash flood and landslide imminent. Move immediately to your designated camp via clear routes. Details: {{link}}'
        })
      },
      ml: {
        type: messageTemplateTierSchema,
        default: () => ({
          watch: 'ഈജിസ്ഫ്ലോ ജാഗ്രതാ നിർദ്ദേശം: നിങ്ങളുടെ പ്രദേശത്ത് കനത്ത മഴ രേഖപ്പെടുത്തിയിട്ടുണ്ട്. ജാഗ്രത പാലിക്കുക. വിവരങ്ങൾക്ക്: {{link}}',
          warning: 'ഈജിസ്ഫ്ലോ മുന്നറിയിപ്പ്: മണ്ണിടിച്ചിൽ, മലവെള്ളപ്പാച്ചിൽ സാധ്യത. ഒഴിഞ്ഞുപോക്ക് പാതകൾ പരിശോധിക്കുക. വിവരങ്ങൾക്ക്: {{link}}',
          evacuate: 'ഈജിസ്ഫ്ലോ അടിയന്തര ഒഴിപ്പിക്കൽ ഉത്തരവ്: അതിതീവ്ര അപകടസാധ്യത. ഉടൻ തന്നെ നിശ്ചയിച്ച ക്യാമ്പിലേക്ക് മാറുക. വിവരങ്ങൾക്ക്: {{link}}'
        })
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

thresholdConfigSchema.index({ isGlobalDefault: 1 });
thresholdConfigSchema.index({ regionId: 1, active: 1 });
thresholdConfigSchema.index({ version: -1 });

export const ThresholdConfig = mongoose.model('ThresholdConfig', thresholdConfigSchema);
