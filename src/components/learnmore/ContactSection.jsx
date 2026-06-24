const contacts = [
  { label: "Email", value: "darrendsa90@gmail.com" },
  { label: "Phone", value: "+91 9096467169" },
  { label: "Location", value: "IMC, Chulna Talav, Vasai(W)" },
];

export default function ContactSection() {
  return (
    <div className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
            Have Questions?
          </h2>
          <p className="text-sm text-muted-foreground mb-10">
            We're here to help. Feel free to reach out anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div
                key={contact.label}
                className="border border-border rounded-md bg-background p-5"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  {contact.label}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {contact.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}