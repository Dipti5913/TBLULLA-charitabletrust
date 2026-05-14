import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, ArrowRight } from "lucide-react";
const logo = "/logot.png";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

 // Static navigation items
 const staticNavigation = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    href: "/about",
    dropdown: [
      { name: "About T.B. Lulla", href: "/about-tb-lulla" },
      { name: "About Kishor Lulla", href: "/about-kishor-lulla" },
    ],
  },
  { name: "Events", href: "/events" },
  { name: "Rotary Global Grant", href: "/rotary-grant" },
  { name: "Video Gallery", href: "/Videogallary" },
  { name: "Our Blog", href: "/pages/ourblog" },
  { name: "Annual Reports", href: "/annual-reports" },
  { name: "NGO", href: "/ngo" },
  { name: "CSR Support", href: "/csr" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
 
  const [projectCategories, setProjectCategories] = useState<any[]>([]);
  const [navigation, setNavigation] = useState(staticNavigation);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  // Fetch project categories from Firebase
  useEffect(() => {
    if (!db) {
      console.log('Navbar: Firebase not initialized, using static categories');
      return;
    }

    console.log('Navbar: Fetching project categories from Firebase');
    
    try {
      const q = query(collection(db, 'projects'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('Navbar: Received', snapshot.docs.length, 'projects');
          
          // Extract unique categories
          const categories = new Set<string>();
          
          // Static categories
          const staticCategories = [
            { name: "Shiku Anande", href: "/projects/shiku-anande" },
            { name: "Literacy", href: "/projects/literacy" },
            { name: "Natural Calamities", href: "/projects/natural-calamities" },
          ];
          
          // Add Firebase categories
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.category && data.category.trim()) {
              categories.add(data.category);
            }
          });

          console.log('Navbar: Found Firebase categories:', Array.from(categories));

          // Create dynamic category links
          const dynamicCategories = Array.from(categories)
            .filter(category => !staticCategories.some(sc => sc.name === category))
            .filter(category => category !== "Rotery WASH") // Exclude Rotery WASH category
            .map(category => ({
              name: category,
              href: `/projects/${category.toLowerCase().replace(/\s+/g, '-')}`
            }));

          // Combine static and dynamic categories
          const allProjectCategories = [...staticCategories, ...dynamicCategories];
          
          console.log('Navbar: Final project categories:', allProjectCategories);
          setProjectCategories(allProjectCategories);
        },
        (error) => {
          console.error('Navbar: Error fetching projects:', error);
          // Fallback to static categories
          setProjectCategories([
            { name: "Shiku Anande", href: "/projects/shiku-anande" },
            { name: "Literacy", href: "/projects/literacy" },
            { name: "Natural Calamities", href: "/projects/natural-calamities" },
          ]);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Navbar: Error setting up Firebase listener:', error);
    }
  }, []);

  // Update navigation when project categories change
  useEffect(() => {
    const updatedNavigation = staticNavigation.map(item => {
      if (item.name === "Our Projects") {
        return {
          name: "Our Projects",
          href: "/projects",
          dropdown: projectCategories
        };
      }
      return item;
    });

    // Add Our Projects if it doesn't exist
    const hasOurProjects = updatedNavigation.some(item => item.name === "Our Projects");
    if (!hasOurProjects) {
      const insertIndex = updatedNavigation.findIndex(item => item.name === "Rotary Global Grant") + 1;
      updatedNavigation.splice(insertIndex, 0, {
        name: "Our Projects",
        href: "/projects",
        dropdown: projectCategories
      });
    }

    setNavigation(updatedNavigation);
  }, [projectCategories]);

  useEffect(() => {
    const handleScroll = () => {
      // Header image height is 80px (h-20), so switch when scrolled past it
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className={`fixed w-full z-50 transition-all duration-200 ${isScrolled ? 'top-0 shadow-xl' : 'top-20'}`}>
      {/* Professional Glass Background */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md border-b border-border/50" />
      
      {/* Subtle Gradient Accent Line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-hope to-trust transition-opacity duration-200 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />

      <nav className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-20 relative">
          {/* Enhanced Desktop Navigation with Gradient Hover Effects */}
          <div className="hidden lg:flex items-center space-x-0">
            {navigation.map((item) =>
              item.dropdown ? (
                <div key={item.name} className="relative group dropdown-container">
                  <button
                    onClick={() =>
                      setDropdownOpen(dropdownOpen === item.name ? null : item.name)
                    }
                    className={cn(
                      "relative px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center group/nav-item whitespace-nowrap",
                      "text-foreground hover:text-primary hover:bg-primary/5",
                      isActive(item.href) ? "text-primary bg-primary/10" : ""
                    )}
                  >
                    <span className="relative z-10 flex items-center">
                      {item.name}
                      <ChevronDown
                        className={cn(
                          "ml-1.5 h-4 w-4 transition-transform duration-300 group-hover/nav-item:rotate-180",
                          dropdownOpen === item.name ? "rotate-180" : ""
                        )}
                      />
                    </span>
                  </button>
                  
                  {/* Professional Dropdown Menu */}
                  {dropdownOpen === item.name && (
                    <div className="absolute left-0 mt-1 w-64 bg-background/95 backdrop-blur-lg border border-border shadow-2xl rounded-xl overflow-hidden transition-all duration-150 transform origin-top">
                      <div className="p-2">
                        {item.dropdown.map((sub, index) => (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            onClick={() => setDropdownOpen(null)}
                            className={cn(
                              "group relative block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 no-underline",
                              "text-foreground hover:text-primary hover:bg-primary/5",
                              isActive(sub.href) 
                                ? "bg-primary/10 text-primary" 
                                : ""
                            )}
                            data-project-link
                          >
                            <div className="flex items-center">
                              <div className={cn(
                                "w-2 h-2 rounded-full mr-3 transition-all duration-300",
                                isActive(sub.href) 
                                  ? "bg-primary" 
                                  : "bg-muted-foreground/30 group-hover:bg-primary/50"
                              )} />
                              {sub.name}
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "relative px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 group whitespace-nowrap no-underline",
                    "text-foreground hover:text-primary hover:bg-primary/5",
                    isActive(item.href) 
                      ? "text-primary bg-primary/10" 
                      : ""
                  )}
                  data-project-link
                >
                  <span className="relative z-10">{item.name}</span>
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary to-hope rounded-full -translate-x-1/2" />
                  )}
                </Link>
              )
            )}
        </div>

          {/* Professional Mobile Menu Button */}
          <div className="lg:hidden absolute right-0 top-1/2 transform -translate-y-1/2 flex-shrink-0 z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-lg bg-primary/5 hover:bg-primary/10 border border-border hover:border-primary/20 transition-all duration-300 group"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                <span className={cn(
                  "block absolute w-5 h-0.5 bg-foreground rounded-full transition-all duration-300",
                  isOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5 group-hover:-translate-y-2"
                )}></span>
                <span className={cn(
                  "block absolute w-5 h-0.5 bg-foreground rounded-full transition-all duration-300",
                  isOpen ? "opacity-0 translate-x-4" : "opacity-100"
                )}></span>
                <span className={cn(
                  "block absolute w-5 h-0.5 bg-foreground rounded-full transition-all duration-300",
                  isOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5 group-hover:translate-y-2"
                )}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Professional Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-200",
            isOpen 
              ? "max-h-[2000px] opacity-100" 
              : "max-h-0 opacity-0"
          )}
        >
          <div className="bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl">
            <div className="px-6 pt-6 pb-8 space-y-2">
              {navigation.map((item) =>
                item.dropdown ? (
                  <div key={item.name} className="space-y-1 dropdown-container">
                    <button
                      onClick={() =>
                        setDropdownOpen(
                          dropdownOpen === item.name ? null : item.name
                        )
                      }
                      className={cn(
                        "w-full text-left px-5 py-3.5 rounded-lg text-base font-semibold flex items-center justify-between transition-all duration-300",
                        "text-foreground hover:text-primary hover:bg-primary/5",
                        isActive(item.href) ? "text-primary bg-primary/10" : ""
                      )}
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-300",
                          dropdownOpen === item.name ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "ml-4 space-y-1 overflow-hidden transition-all duration-300 border-l-2 border-border pl-3",
                        dropdownOpen === item.name
                          ? "max-h-96 opacity-100 mt-2"
                          : "max-h-0 opacity-0 mt-0"
                      )}
                    >
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.href}
                          onClick={() => {
                            setIsOpen(false);
                            setDropdownOpen(null);
                          }}
                          className={cn(
                            "block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group/mobile-item",
                            "text-foreground hover:text-primary hover:bg-primary/5",
                            isActive(sub.href)
                              ? "text-primary bg-primary/10"
                              : ""
                          )}
                        >
                          <div className="flex items-center">
                            <div className={cn(
                              "w-2 h-2 rounded-full mr-3 transition-all duration-300",
                              isActive(sub.href) 
                                ? "bg-primary" 
                                : "bg-muted-foreground/30 group-hover/mobile-item:bg-primary/50"
                            )} />
                            {sub.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-5 py-3.5 rounded-lg text-base font-semibold transition-all duration-300",
                      "text-foreground hover:text-primary hover:bg-primary/5",
                      isActive(item.href)
                        ? "text-primary bg-primary/10"
                        : ""
                    )}
                  >
                    {item.name}
                  </Link>
                )
              )}
              
              {/* Professional Mobile CTA Button */}
              {/* Donate CTA removed */}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
