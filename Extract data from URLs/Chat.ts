import { MetaTagUrlAndDocument} from '../mod.ts'

export interface DiscordServer {
  name: string | undefined;
}
export function extractDiscordInfo({ document }: MetaTagUrlAndDocument): { server?: DiscordServer } {
  return {
    server: {
      name: document.querySelector("title")?.textContent,
    },
  };
}
