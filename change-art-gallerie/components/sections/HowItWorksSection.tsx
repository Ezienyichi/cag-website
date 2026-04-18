export default function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Choose',
      description: "Pick the collection that fits your child's age and interest from our library.",
      color: 'text-primary',
    },
    {
      number: '2',
      title: 'Download',
      description: 'Order physical copies or get instant digital downloads for immediate printing.',
      color: 'text-secondary',
    },
    {
      number: '3',
      title: 'Create',
      description: 'Follow the playful prompts and start your journey of artistic discovery.',
      color: 'text-tertiary',
    },
  ];

  return (
    <section className="py-20 md:py-24 px-6 md:px-8 bg-surface-container">
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 md:mb-20 italic underline decoration-secondary-container decoration-8 underline-offset-4 font-headline">
          How to Start Creating
        </h2>

        <div className="relative grid md:grid-cols-3 gap-12 md:gap-16">
          {/* Connector line */}
          <div className="hidden md:block absolute top-24 left-0 w-full border-t-2 border-dashed border-outline-variant/30" />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 md:w-20 md:h-20 bg-surface-container-lowest rounded-full flex items-center justify-center text-2xl md:text-3xl font-black ambient-shadow mb-6 md:mb-8 z-10 ${step.color} font-headline`}
              >
                {step.number}
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-headline mb-2">{step.title}</h3>
              <p className="text-on-surface-variant max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
