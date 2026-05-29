export {};

interface Google {
  accounts: {
    id: {
      initialize: Function;
      prompt: Function;
    };
  };
}

declare global {
  interface Window {
    google: Google;
  }
}