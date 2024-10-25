import { createI18n } from 'vue-i18n';
import enUS from './en-US.json';
import jaJP from './ja-JP.json';

type MessageSchema = typeof enUS;

//Doc: https://vue-i18n.intlify.dev/
const supportLanguage: {
  [key: string]: {
    name: string;
    file: MessageSchema;
    image?: string;
    label?: string;
  };
} = {
  'en-US': { name: 'English', file: enUS, label: 'En' },
  'ja-JP': { name: 'Japan', file: jaJP, label: 'Ja' },
};

const message: { [key: string]: MessageSchema } = {};
Object.keys(supportLanguage).forEach((key: string) => {
  message[key] = supportLanguage[key].file;
});

const i18n = createI18n<{ message: MessageSchema }, string>({
  legacy: false,
  locale: 'en-US',
  globalInjection: true,
  messages: message,
});

export { i18n, supportLanguage };
