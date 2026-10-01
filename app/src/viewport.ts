/**
 * While the on-screen keyboard is open the layout viewport keeps its full height but only the
 * visual viewport above the keyboard is visible. Mirror it into `--vvh` / `--vv-top` so fixed
 * overlays (dialogs) can size to what the user can actually see. Unset otherwise, and while
 * pinch-zoomed, so overlays fall back to the plain dynamic viewport.
 */
export function trackVisualViewport() {
  const vv = window.visualViewport
  if (!vv) return
  const style = document.documentElement.style
  const sync = () => {
    if (vv.scale === 1 && window.innerHeight - vv.height > 80) {
      style.setProperty('--vvh', `${vv.height}px`)
      style.setProperty('--vv-top', `${vv.offsetTop}px`)
    } else {
      style.removeProperty('--vvh')
      style.removeProperty('--vv-top')
    }
  }
  vv.addEventListener('resize', sync)
  vv.addEventListener('scroll', sync)
  sync()
}
