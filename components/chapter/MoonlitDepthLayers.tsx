type MoonlitDepthLayersProps = {
  playing: boolean;
};

export function MoonlitDepthLayers({ playing }: MoonlitDepthLayersProps) {
  return (
    <div className={`moonlit-depth-layers${playing ? " is-playing" : ""}`} aria-hidden="true">
      <div className="moonlit-violet-reaches">
        <i />
        <i />
      </div>
      <div className="moonlit-ink-ridges">
        <i />
        <i />
        <i />
      </div>
      <div className="moonlit-cloud-veil">
        <i />
        <i />
        <i />
      </div>
      <div className="moonlit-foreground-veil">
        <i />
        <i />
      </div>
    </div>
  );
}
