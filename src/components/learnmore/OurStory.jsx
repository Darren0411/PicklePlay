export default function OurStory() {
  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-8">
            Our Story
          </h2>
          <div className="border border-border rounded-md p-8 bg-card space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              PicklePlay was born from a simple belief: everyone should be able
              to enjoy pickleball without worrying about expensive court fees. We
              wanted to create an accessible space where players of all levels
              could come together and play.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We invested in a quality indoor court with professional lighting
              and all the equipment you need — all while keeping our prices
              affordable at just ₹200 per hour.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Today, PicklePlay is a welcoming community where beginners learn,
              friends compete, and everyone enjoys the game without the premium
              price tag.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}