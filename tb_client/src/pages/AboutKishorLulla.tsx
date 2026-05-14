import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutKishorLulla() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-card-accent to-background">
        <div className="container-max">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <Badge variant="outline" className="text-primary border-primary/20">
              About Kishor Lulla
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              <span className="text-gradient-primary">About Kishor Lulla</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Life & Legacy Section */}
      <section className="relative py-12 lg:py-20 bg-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Leadership & Legacy
            </div>
            <div className="flex justify-center mb-8">
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-12">
            {/* Image Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <img
                src="/KTLulla.jpg"
                alt="About Kishor Lulla"
                className="relative w-80 md:w-96 lg:w-[400px] rounded-3xl shadow-2xl object-cover mx-auto group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content Card */}
            <div className="max-w-6xl mx-auto">
              <div className="relative bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-3xl p-8 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-700 group">
                {/* Card Border Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative space-y-8 text-center">
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
                    Shri. <span className="text-black">Kishor Lulla</span>
                  </h2>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                    <ul className="list-none space-y-4 text-left text-lg text-gray-700 leading-relaxed max-w-5xl mx-auto">
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>Advocate Kishor Lulla is B.Com.LL.B & by profession, he is Sales Tax Consultant since 1980. He is practicing in the firm T.B.Lulla & Company at Sangli, which is established in 1959.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He has also expertise in Goods and Service Tax and Profession Tax.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>His son Amit has also joined him as Sales Tax Consultant and doughter-In-Law Gunjan Lulla joined him as G.S.T. Consultant.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is Member of The Sales Tax Practitioner's Association of Maharashtra from 2005-06.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is Member of All India Federation of Tax Practitioner's Association.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>Mr. Lulla is past president of Taxation Consultants Association, Sangli.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>As a paper writer in seminars, study circles & coaching classes, he creates awareness on various topics of GST & also on Right to Information Act.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is actively doing property business under the name of Lulla Estate Developer Pvt Ltd.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is member of CREDAI Sangli.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is Chairman of T.B Lulla Charitable Foundation.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>Other than taxation field, he does a lot of social work of Consumer Awareness since 1986.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>To curb the corruption, he has collected confidential or information of various Government & Semi Government Departments under RTI.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is activist of Akhil Bhartiya Grahak Panchayat.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is Member of Rotary Club of sangli. Kishor Lulla and Amit Lulla are Arch Klumph Society members of Rotary Foundation.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is Past President of Bharat Vikas Parishad, Sangli.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is Managing Committee member of Builders Associations of India,Sangli. He is also a member of Promoters & Builders Association, Sangli.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He continuously writes articles on Taxation, Consumer Awareness, Right to Information Act in news papers and magazines. A number of talks on various subjects were delivered on Radio & TV.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He is recipient of Late Balasaheb Galgale Award 2015 for most active social work.</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-3"></div>
                        <span>He has been declared as Sangli Icon in the book published by POLAD.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Legacy Card */}
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-white/90 backdrop-blur-sm border border-indigo-200/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500">
                <div className="text-center">
                  <p className="text-xl text-gray-700 leading-relaxed italic">
                    "His leadership gave birth to initiatives in primary and secondary education, improving the quality of government schools and training teachers to create meaningful impact."
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
