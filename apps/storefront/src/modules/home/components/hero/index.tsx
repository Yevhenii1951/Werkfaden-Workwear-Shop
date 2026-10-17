import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading } from "@modules/common/components/ui"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base font-normal"
          >
            Arbeitskleidung für jeden Einsatz
          </Heading>
          <Heading
            level="h2"
            className="text-3xl leading-10 text-ui-fg-subtle font-normal"
          >
            Robuste Kleidung für Werkstatt, Baustelle und Team.
          </Heading>
        </span>
        <LocalizedClientLink
          href="/categories/t-shirts"
          className="inline-flex h-12 items-center justify-center rounded-md bg-black px-6 text-lg font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          T-Shirts entdecken
        </LocalizedClientLink>
      </div>
    </div>
  );
};

export default Hero;
