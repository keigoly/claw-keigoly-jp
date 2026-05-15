interface Props {
  children: React.ReactNode;
}

export default function ClawSpeech({ children }: Props) {
  return (
    <aside className="claw-speech">
      <div className="claw-speech-header">
        <img src="/claw-icon.jpeg" alt="Clawくん" className="claw-speech-icon" draggable="false" />
        <span className="claw-speech-name">Clawくん</span>
      </div>
      <div className="claw-speech-body">{children}</div>
    </aside>
  );
}
