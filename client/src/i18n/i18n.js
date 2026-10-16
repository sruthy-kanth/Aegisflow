import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'AegisFlow',
      appSubtitle: 'Regional Early-Warning & Evacuation-Coordination Platform',
      roles: {
        SUPERADMIN: 'Platform Superadmin',
        ADMIN: 'Regional Disaster Officer',
        VOLUNTEER: 'Ground Volunteer',
        WARDEN: 'Sector Route Warden'
      },
      nav: {
        health: 'System Health',
        regions: 'Regions Management',
        admins: 'Admin Accounts',
        thresholds: 'Thresholds & Templates',
        sensors: 'Sensor Registry',
        providers: 'Messaging Gateway',
        audit: 'Audit Log',
        logout: 'Sign Out'
      },
      status: {
        active: 'Operational',
        degraded: 'Degraded',
        silent: 'Silent (No ping)',
        inactive: 'Inactive'
      },
      tiers: {
        none: 'Safe / Normal',
        watch: 'Watch Advisory',
        warning: 'Warning Alert',
        evacuate: 'Mandatory Evacuate'
      },
      common: {
        loading: 'Loading system state...',
        save: 'Save Changes',
        cancel: 'Cancel',
        create: 'Create',
        delete: 'Deactivate',
        actions: 'Actions',
        refresh: 'Refresh',
        copy: 'Copy Key',
        copied: 'Copied!',
        search: 'Search...',
        allRegions: 'All Regions'
      }
    }
  },
  ml: {
    translation: {
      appName: 'ഈജിസ്ഫ്ലോ',
      appSubtitle: 'മണ്ണിടിച്ചിൽ - മലവെള്ളപ്പാച്ചിൽ മുൻകൂർ മുന്നറിയിപ്പ് പ്ലാറ്റ്‌ഫോം',
      roles: {
        SUPERADMIN: 'പ്ലാറ്റ്‌ഫോം സൂപ്പർ അഡ്മിൻ',
        ADMIN: 'മേഖലാ ദുരന്തനിവാരണ ഓഫീസർ',
        VOLUNTEER: 'രക്ഷാപ്രവർത്തകൻ (വോളണ്ടിയർ)',
        WARDEN: 'റൂട്ട് വാർഡൻ'
      },
      nav: {
        health: 'സിസ്റ്റം ആരോഗ്യം',
        regions: 'മേഖലകൾ',
        admins: 'ഉദ്യോഗസ്ഥ അക്കൗണ്ടുകൾ',
        thresholds: 'മാനദണ്ഡങ്ങളും സന്ദേശങ്ങളും',
        sensors: 'സെൻസർ രജിസ്ട്രി',
        providers: 'മെസേജിംഗ് ഗേറ്റ്‌വേ',
        audit: 'ഓഡിറ്റ് ലോഗ്',
        logout: 'പുറത്തിറങ്ങുക'
      },
      status: {
        active: 'പ്രവർത്തനക്ഷമം',
        degraded: 'ഭാഗിക തകരാർ',
        silent: 'ബന്ധപ്പെടാനായില്ല',
        inactive: 'നിഷ്ക്രിയം'
      },
      tiers: {
        none: 'സാധാരണ നില / സുരക്ഷിതം',
        watch: 'നിരീക്ഷണ ജാഗ്രത',
        warning: 'അപകട മുന്നറിയിപ്പ്',
        evacuate: 'ഉടൻ ഒഴിഞ്ഞുപോവുക'
      },
      common: {
        loading: 'വിവരങ്ങൾ ലഭ്യമാക്കുന്നു...',
        save: 'സൂക്ഷിക്കുക',
        cancel: 'റദ്ദാക്കുക',
        create: 'പുതിയത് ചേർക്കുക',
        delete: 'നിഷ്ക്രിയമാക്കുക',
        actions: 'നടപടികൾ',
        refresh: 'പുതുക്കുക',
        copy: 'കോപ്പി ചെയ്യുക',
        copied: 'കോപ്പി ചെയ്തു!',
        search: 'തിരയുക...',
        allRegions: 'എല്ലാ മേഖലകളും'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('aegisflow_lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
