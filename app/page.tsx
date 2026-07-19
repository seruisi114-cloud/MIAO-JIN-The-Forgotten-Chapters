import { ForgottenKeyGate } from "@/components/forgotten-key/ForgottenKeyGate";
import { AudioManagerProvider } from "@/components/audio/AudioManager";

export default function Home() {
  return (
    <main className="universe-page">
      <AudioManagerProvider>
        <ForgottenKeyGate />
      </AudioManagerProvider>
    </main>
  );
}
