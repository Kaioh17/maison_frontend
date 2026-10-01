/** Scroll a horizontal carousel only. Never use scrollIntoView on cards: it also scrolls every scrollable ancestor (page snap container, modal overlay) and makes them jump. */
export function scrollPricingCarouselToCard(carousel: HTMLElement, card: HTMLElement, behavior: ScrollBehavior) {
  const cr = carousel.getBoundingClientRect()
  const rr = card.getBoundingClientRect()
  const next = carousel.scrollLeft + (rr.left - cr.left) - (cr.width / 2 - rr.width / 2)
  carousel.scrollTo({ left: Math.max(0, next), behavior })
}
