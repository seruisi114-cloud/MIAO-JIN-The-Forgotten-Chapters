type MoonlitDepthLayersProps = {
  playing: boolean;
};

export function MoonlitDepthLayers({ playing }: MoonlitDepthLayersProps) {
  return (
    <div className={`moonlit-depth-layers${playing ? " is-playing" : ""}`} aria-hidden="true">
      <div className="moonlit-ink-ridges">
        <i />
        <i />
      </div>
      <div className="moonlit-cloud-veil">
        <i />
        <i />
      </div>
      <div className="moonlit-foreground-veil">
        <i />
      </div>
    </div>
  );
}
