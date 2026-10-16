const faqs = [
  {
    question: "What if I need to cancel my booking?",
    answer:
      "You can cancel up to 2 hours before your slot time for a full refund. Cancellations within 2 hours are non-refundable.",
  },
  {
    question: "Do you provide equipment?",
    answer:
      "Yes! We provide paddles and pickleballs at no extra charge. You're also welcome to bring your own equipment if you prefer.",
  },
  {
    question: "How many people can play at once?",
    answer:
      "Our court accommodates singles (2 players) or doubles (4 players). The rate is ₹200/hour regardless of how many people play.",
  },
  {
    question: "Is the court suitable for beginners?",
    answer:
      "Absolutely! Our court welcomes players of all skill levels. Whether you're just starting out or a seasoned pro, you'll enjoy playing here.",
  },
  {
    question: "What are your operating hours?",
    answer:
      "We're open daily from 6:00 AM to 10:00 PM. You can book any available slot within these hours through our website.",
  },
  {
    question: "Can I book multiple hours at once?",
    answer:
      "Yes! Simply select multiple consecutive time slots during booking. Perfect for extended practice sessions or tournaments.",
  },
];

export default function FAQSection() {
  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="border border-border rounded-md bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}