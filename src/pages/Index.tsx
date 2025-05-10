
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      title: "AI-Powered Matching",
      description:
        "Our intelligent system matches students wanting to swap the same classes, streamlining the entire process.",
      icon: "📊",
    },
    {
      title: "Easy Section Swaps",
      description:
        "Submit your current section and desired section for quick matchmaking with other students.",
      icon: "🔄",
    },
    {
      title: "Petition Generation",
      description:
        "When demand hits 20+ students, we automatically generate petitions for new class sections.",
      icon: "📝",
    },
    {
      title: "Direct Coordination",
      description:
        "Connect directly with matched students via Telegram for seamless coordination.",
      icon: "💬",
    },
  ];

  const stats = [
    { value: "2,500+", label: "Students" },
    { value: "15+", label: "Universities" },
    { value: "95%", label: "Success Rate" },
    { value: "1,000+", label: "Swaps Completed" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="hero-pattern py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-campus-blue">
              Swap Classes <span className="text-campus-teal">Smarter</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-700 max-w-lg">
              CampusLink AI connects university students who want to swap class sections
              and helps petition for new sections when demand is high.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="font-semibold px-8">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="font-semibold px-8"
              >
                <a href="#how-it-works">Learn More</a>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-campus-blue rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-campus-teal rounded-full opacity-20"></div>
              <div className="relative bg-white rounded-xl shadow-xl p-6 z-10">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-xl font-semibold text-campus-blue">Quick Swap Request</h3>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">I currently have:</label>
                    <div className="bg-gray-100 rounded-md p-3 border border-gray-200">
                      Machine Learning - Section 1 (Mon/Wed 10:00 AM)
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">I want to swap for:</label>
                    <div className="bg-gray-100 rounded-md p-3 border border-gray-200">
                      Machine Learning - Section 2 (Sun/Tue/Thu 2:00 PM)
                    </div>
                  </div>
                </div>
                <Button className="w-full">Find a Match</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-campus-blue text-white py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-4">
                <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                <p className="text-sm md:text-base opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How CampusLink AI Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform makes class section swapping and petitioning
              simple, efficient, and effective for university students.
            </p>
          </div>

          <div className="relative">
            {/* Timeline */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>

            {/* Timeline Items */}
            <div className="space-y-12 md:space-y-24 relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 mb-6 md:mb-0">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-campus-blue text-white font-bold mb-4">
                      1
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Submit Your Request</h3>
                    <p className="text-gray-600">
                      Enter your current section and the desired section you'd like to swap to.
                      Use our dropdown menus to ensure accurate course information.
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center w-8 h-8 bg-campus-blue rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:order-last mb-6 md:mb-0">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-campus-teal text-white font-bold mb-4">
                      2
                    </div>
                    <h3 className="text-xl font-semibold mb-3">AI Matching System</h3>
                    <p className="text-gray-600">
                      Our AI analyzes all requests and detects matching opportunities between students
                      who want each other's sections.
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center w-8 h-8 bg-campus-teal rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
                <div className="md:w-1/2 md:pl-12 md:order-first"></div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 mb-6 md:mb-0">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-campus-blue text-white font-bold mb-4">
                      3
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Get Notified</h3>
                    <p className="text-gray-600">
                      When a match is found, both students receive notifications with
                      contact options to coordinate the swap directly.
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center w-8 h-8 bg-campus-blue rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:order-last mb-6 md:mb-0">
                  <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-campus-teal text-white font-bold mb-4">
                      4
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Auto-Petition System</h3>
                    <p className="text-gray-600">
                      When 20+ students request the same section, we automatically generate
                      a petition to help facilitate the process with faculty.
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center w-8 h-8 bg-campus-teal rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
                <div className="md:w-1/2 md:pl-12 md:order-first"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed specifically for university students, our platform offers
              powerful tools to simplify class scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-campus-blue">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-campus-blue text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Simplify Your Class Schedule?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of university students already using CampusLink AI
            to find their perfect class schedule.
          </p>
          <Button asChild size="lg" variant="secondary" className="font-semibold px-8">
            <Link to="/auth">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
