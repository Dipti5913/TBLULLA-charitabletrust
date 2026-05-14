import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutTBLulla() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-card-accent to-background">
        <div className="container-max">
          <div className="text-center space-y-6  max-w-4xl mx-auto">
            <Badge variant="outline" className="text-primary border-primary/20">
              About T.B. Lulla
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              Remembering <span className="text-gradient-primary"><br />T.B. Lulla</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Life & Legacy Section */}
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Founder's Legacy
            </div>
            <div className="flex justify-center mb-8">
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-12">
            {/* Image Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img
                src="/TBLulla.jpg"
                alt="T.B. Lulla"
                className="relative w-80 md:w-96 lg:w-[400px] rounded-3xl shadow-2xl object-cover mx-auto group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content Card */}
            <div className="max-w-6xl mx-auto">
              <div className="relative bg-white/80 backdrop-blur-sm border border-emerald-200/50 rounded-3xl p-8 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-700 group">
                {/* Card Border Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-green-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative space-y-8 text-center">
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
                    Shri. <span className="text-black">Totaram Bhojraj Lulla</span>
                  </h2>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 space-y-6">
                    <p className="text-lg lg:text-xl text-gray-700 leading-relaxed text-justify max-w-5xl mx-auto">
                      Shri. Totaram Bhojraj Lulla, a renowned name in the field of taxation, migrated in 1947 to India
                      along with his father, mother, brothers & sisters after leaving behind well-earned money &
                      well-settled property. His family was staying at Shikarpur in Sindh Prant. He was one of the lakhs
                      of Sindhi people who fortunately could save their lives in spite of slaying in the train from Sindh
                      to Gujarat.
                    </p>
                    
                    <p className="text-lg lg:text-xl text-gray-700 leading-relaxed text-justify max-w-5xl mx-auto">
                      Born on 12th Oct 1935, he completed his post graduation of Law degree from Govt Law College, Mumbai. For his fees & expenses, he sold toffees in local trains of Mumbai. As a Sales Tax inspector from Mumbai he was transferred to Kolhapur & then to Sangli, where he started practice in taxation in the year 1958, after resigning from the Sales Tax Department.
                    </p>
                    
                    <p className="text-lg lg:text-xl text-gray-700 leading-relaxed text-justify max-w-5xl mx-auto">
                      Due to his calm, quiet & non-greedy nature, he became "DADDY", not only of his two sons but also of the entire community. A book "Sindhu te Krishna" was published when he was 71, to present before the Maharashtrian Community about the struggle faced by entire Sindhi's at the time of partition.
                    </p>
                    
                    <p className="text-lg lg:text-xl text-gray-700 leading-relaxed text-justify max-w-5xl mx-auto">
                      He passed away on 28th Sept 2010 leaving behind his wife, two sons, grandson & grand daughter. The achievements in his life are commendable, and his legacy continues through the T.B. Lulla Charitable Foundation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legacy Quote Card */}
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-white/90 backdrop-blur-sm border border-emerald-200/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500">
                <div className="text-center">
                  <p className="text-xl text-gray-700 leading-relaxed italic">
                    "A visionary who laid the foundation for generations of service, transforming challenges into opportunities for social good."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}
