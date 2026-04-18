export default function BenefitsSection() {
  const benefits = [
    {
      icon: 'lightbulb',
      title: 'Boost Creativity',
      description: 'Our guided prompts encourage divergent thinking and unique artistic expression in every lesson.',
      colorClass: 'bg-primary-container/20 group-hover:bg-primary-container',
      iconColor: 'text-primary',
    },
    {
      icon: 'devices_off',
      title: 'Screen-free Learning',
      description: 'Authentic physical experiences that connect hand, eye, and heart away from digital distractions.',
      colorClass: 'bg-secondary-container/20 group-hover:bg-secondary-container',
      iconColor: 'text-secondary',
      offset: true,
    },
    {
      icon: 'school',
      title: 'Perfect for Schools',
      description: "Aligned with educational standards but delivered with the joy of a home art studio.",
      colorClass: 'bg-tertiary-container/20 group-hover:bg-tertiary-container',
      iconColor: 'text-tertiary',
      offset: true,
    },
  ];

  return (
    <section id="benefits" className="bg-surface-container-low rounded-t-xl py-20 md:py-24 px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
            Why Parents &amp; Teachers Love Us
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={`bg-surface p-8 md:p-10 rounded-xl hover:scale-105 transition-transform duration-300 group ${
                b.offset ? 'mt-0 md:mt-8' : ''
              }`}
            >
              <div
                className={`w-14 h-14 md:w-16 md:h-16 ${b.colorClass} rounded-xl flex items-center justify-center mb-6 transition-colors`}
              >
                <span className={`material-symbols-outlined text-2xl md:text-3xl ${b.iconColor}`}>
                  {b.icon}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-headline mb-3">{b.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
