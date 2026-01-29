"use client";
import { Briefcase, MapPin, Clock, ChevronDown, ChevronUp, Building2, Cpu, Wrench, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  softwareExpert?: {
    title: string;
    items: string[];
  };
  responsibilities: string[];
  requirements: string[];
}

const jobListings: JobListing[] = [
  {
    id: "senior-transformer-design-engineer",
    title: "Senior Transformer Design Engineer",
    department: "Engineering",
    location: "Austin, TX",
    type: "Full-time",
    summary: `We are looking for a rare "dual-threat" Design Engineer who excels in both Electromagnetic Analysis and Mechanical Construction. You will not rely on separate departments for calculations and layouts; you will own the design holistically. The ideal candidate is a software power-user who utilizes advanced simulation and parametric CAD to create designs that are electrically efficient and optimized for manufacturing (DFM).`,
    softwareExpert: {
      title: 'The "Software Expert" We Need',
      items: [
        "Electrical Simulation: You must be proficient in modeling flux density, losses, and impedance using tools like ANSYS Maxwell, COMSOL, or proprietary magnetics software.",
        "Mechanical CAD: You must operate at an expert level in SolidWorks, Inventor, or Creo. We expect parametric modeling skills—where changing an electrical variable automatically updates the mechanical model."
      ]
    },
    responsibilities: [
      "Electrical Design: perform detailed calculations for windings, core geometry, insulation coordination, and thermal performance.",
      "Mechanical Execution: Create complex 3D assemblies for tanks, clamping structures, and bus work.",
      "DFM Optimization: Bridge the gap between theory and reality. Design components that account for material tolerances, bending radii, and assembly access to ensure smooth production.",
      "Validation: Use software to run dielectric stress analysis (Electrical) and structural/seismic FEA (Mechanical) prior to release."
    ],
    requirements: [
      "Education: We don't care how you got here—degree, self-taught, trade school, YouTube University. Are you the best at what you do? That's what we want.",
      "Experience: 5+ years of comprehensive transformer design experience.",
      "Technical Depth: Demonstrated ability to take a spec sheet and produce a complete, manufacturing-ready design package (Calculations + Drawings + BOM) without hand-holding.",
      "Growth Mindset: This role has no ceiling. If you can own more of the process—quoting, customer specs, manufacturing oversight—we'll hand you the keys. Show us what you've got."
    ]
  },
  {
    id: "supply-chain-manager",
    title: "Supply Chain Manager",
    department: "Logistics",
    location: "Austin, TX",
    type: "Full-time",
    summary: "We need someone who can navigate the chaos of global transformer supply chains. You'll manage vendor relationships, optimize inventory, and ensure we never miss a delivery window. If you've dealt with long lead-time components and international freight, you know the game.",
    responsibilities: [
      "Manage end-to-end supply chain for transformer components including core steel, copper, and specialty insulation materials.",
      "Build and maintain relationships with domestic and international suppliers.",
      "Optimize inventory levels to balance cash flow with production demands.",
      "Coordinate logistics for oversized/overweight transformer shipments."
    ],
    requirements: [
      "Education: We don't care how you got here. Can you move mountains (or at least 50-ton transformers)? That's what matters.",
      "Experience: 5+ years in industrial supply chain, preferably heavy electrical equipment.",
      "Technical Knowledge: Understanding of transformer components and their sourcing challenges.",
      "Growth Mindset: Own more than just supply chain—get involved in vendor development, cost engineering, whatever you can handle."
    ]
  },
  {
    id: "transportation-permits-specialist",
    title: "Transportation & Permits Specialist",
    department: "Logistics",
    location: "Austin, TX",
    type: "Full-time",
    summary: "Moving a 100,000 lb transformer across state lines isn't like shipping an Amazon package. You'll be our expert on DOT regulations, oversize/overweight permits, route planning, and utility coordination. If you know the difference between a single-trip permit and a blanket permit, we want to talk.",
    responsibilities: [
      "Obtain all necessary permits for oversized and overweight transformer shipments across multiple states.",
      "Plan routes considering bridge weights, overhead clearances, and utility interference.",
      "Coordinate with state DOTs, escort services, and utility companies for power line lifts.",
      "Maintain compliance with all federal and state transportation regulations."
    ],
    requirements: [
      "Education: Formal training is nice, but we care more about whether you can get a 16-wide load from Houston to Montana without a hitch.",
      "Experience: 3+ years in heavy haul permitting and logistics.",
      "Relationships: Established connections with state DOT offices and escort services are a huge plus.",
      "Growth Mindset: Want to build out our entire transportation operation? This role can grow as big as you can take it."
    ]
  },
  {
    id: "logistics-coordinator",
    title: "Logistics Coordinator",
    department: "Logistics",
    location: "Austin, TX",
    type: "Full-time",
    summary: "You're the air traffic controller for our shipments. Inbound materials, outbound transformers, expedited parts—you keep it all moving. Detail-oriented, unflappable under pressure, and able to juggle a dozen priorities at once.",
    responsibilities: [
      "Coordinate inbound shipments of raw materials and components from global suppliers.",
      "Schedule outbound transformer deliveries to meet customer installation timelines.",
      "Track shipments and proactively resolve delays or issues.",
      "Work with production to align shipping schedules with manufacturing completion dates."
    ],
    requirements: [
      "Education: Degrees are great, but we'd rather see someone who can keep 50 shipments straight without breaking a sweat.",
      "Experience: 2+ years in logistics coordination, freight forwarding, or similar roles.",
      "Tech Savvy: Comfortable with TMS systems, Excel, and learning new tools quickly.",
      "Growth Mindset: Start here, but there's no limit. Prove yourself and take on bigger challenges."
    ]
  },
  {
    id: "trade-compliance-specialist",
    title: "Trade Compliance Specialist",
    department: "Logistics",
    location: "Austin, TX",
    type: "Full-time",
    summary: "Transformers contain materials from around the world, and international trade is a minefield of tariffs, duties, and regulations. You'll ensure we're compliant with import/export laws, manage customs documentation, and find ways to optimize our duty exposure.",
    responsibilities: [
      "Manage import/export documentation and ensure compliance with U.S. Customs and international trade regulations.",
      "Classify products under HTS codes and manage country-of-origin documentation.",
      "Work with customs brokers to clear shipments efficiently.",
      "Identify opportunities to reduce duty costs through FTAs, duty drawback, or bonded warehousing."
    ],
    requirements: [
      "Education: Licensed Customs Broker is a plus, but not required if you know the trade inside and out.",
      "Experience: 3+ years in trade compliance, customs brokerage, or import/export operations.",
      "Knowledge: Strong understanding of HTS classification, FTAs, and CBP requirements.",
      "Growth Mindset: We're growing internationally—help us build the compliance infrastructure from the ground up."
    ]
  },
  {
    id: "manufacturing-automation-engineer",
    title: "Manufacturing Automation Engineer",
    department: "Manufacturing",
    location: "Austin, TX",
    type: "Full-time",
    summary: "We're building a next-gen transformer manufacturing facility and need someone who can design and implement automation systems from the ground up. PLCs, robotics, vision systems—if it moves on the factory floor, you'll make it smarter and faster.",
    responsibilities: [
      "Design and program PLC-based automation systems for transformer manufacturing processes.",
      "Integrate robotic systems for winding, stacking, and material handling operations.",
      "Develop HMI interfaces for operator control and process monitoring.",
      "Implement vision systems for quality inspection and process control."
    ],
    requirements: [
      "Education: We care about what you can build, not where you learned it. Show us your projects.",
      "Experience: 5+ years in manufacturing automation, preferably heavy industry.",
      "Technical Skills: Expert-level PLC programming (Allen-Bradley, Siemens), robotics integration, and industrial networking.",
      "Growth Mindset: This isn't just maintaining existing systems—you're designing our automated future. Own it."
    ]
  },
  {
    id: "production-supervisor",
    title: "Production Supervisor",
    department: "Manufacturing",
    location: "Austin, TX",
    type: "Full-time",
    summary: "You'll lead a team building some of the most complex electrical equipment on the planet. This isn't babysitting—it's coaching, problem-solving, and driving continuous improvement every single day. If you can keep a crew motivated while hitting quality and delivery targets, let's talk.",
    responsibilities: [
      "Supervise daily manufacturing operations across winding, core assembly, and final assembly departments.",
      "Lead and develop a team of skilled technicians and assemblers.",
      "Drive continuous improvement initiatives to reduce cycle time and improve quality.",
      "Coordinate with engineering and quality teams to resolve production issues."
    ],
    requirements: [
      "Education: Leadership isn't taught in a classroom. We want someone who's earned respect on the shop floor.",
      "Experience: 5+ years in manufacturing supervision, preferably electrical equipment or heavy machinery.",
      "Leadership: Proven ability to build and motivate high-performing teams.",
      "Growth Mindset: Start with one shift, but we're scaling fast. Plant manager potential? Even better."
    ]
  },
  {
    id: "process-engineer",
    title: "Process Engineer",
    department: "Manufacturing",
    location: "Austin, TX",
    type: "Full-time",
    summary: "You'll own our manufacturing processes—documenting them, optimizing them, and designing new ones as we scale. Lean manufacturing, Six Sigma, time studies—whatever tools get results. We need someone obsessed with eliminating waste and improving throughput.",
    responsibilities: [
      "Develop and document manufacturing processes for transformer production.",
      "Conduct time studies and line balancing to optimize workflow.",
      "Lead Lean/Six Sigma improvement projects with measurable results.",
      "Design workstations, fixtures, and tooling to improve ergonomics and efficiency."
    ],
    requirements: [
      "Education: Certifications are nice, but we'd rather see a portfolio of processes you've actually improved.",
      "Experience: 3+ years in process or industrial engineering in a manufacturing environment.",
      "Methodology: Strong foundation in Lean manufacturing principles and data-driven decision making.",
      "Growth Mindset: Help us build the manufacturing playbook from scratch. This role grows with the company."
    ]
  },
  {
    id: "amorphous-steel-materials-scientist",
    title: "Amorphous Steel Materials Scientist",
    department: "Engineering",
    location: "Austin, TX",
    type: "Full-time",
    summary: "Amorphous metal cores are the future of ultra-efficient transformers, and we need someone who understands them at the atomic level. You'll work on material characterization, core loss optimization, and pushing the boundaries of what's possible with next-gen magnetic materials.",
    responsibilities: [
      "Lead R&D efforts on amorphous and nanocrystalline core materials for transformer applications.",
      "Characterize magnetic properties including core loss, permeability, and saturation flux density.",
      "Develop processing techniques to optimize material performance and reduce brittleness challenges.",
      "Collaborate with design engineering to translate material properties into practical transformer designs."
    ],
    requirements: [
      "Education: Advanced degree in materials science, metallurgy, or physics preferred—but if you've published papers or hold patents in amorphous metals, we're listening.",
      "Experience: 3+ years working with soft magnetic materials, preferably amorphous or nanocrystalline alloys.",
      "Technical Depth: Deep understanding of magnetic domain theory, annealing processes, and loss mechanisms.",
      "Growth Mindset: Help us become the leader in amorphous core technology. Shape the research agenda."
    ]
  },
  {
    id: "core-design-engineer-amorphous",
    title: "Core Design Engineer – Amorphous Specialist",
    department: "Engineering",
    location: "Austin, TX",
    type: "Full-time",
    summary: "Designing transformer cores with amorphous steel is a different beast—brittle material, unique stacking techniques, and thermal considerations that don't apply to conventional CRGO. We need an engineer who's mastered this specialty and can push our core designs to the next level.",
    responsibilities: [
      "Design amorphous metal distribution transformer cores optimized for low no-load losses.",
      "Develop core cutting and stacking processes that minimize material stress and maintain magnetic properties.",
      "Work with manufacturing to solve the unique handling and assembly challenges of amorphous steel.",
      "Perform electromagnetic simulations to predict and optimize core performance."
    ],
    requirements: [
      "Education: Your hands-on experience with amorphous cores matters more than your diploma.",
      "Experience: 5+ years in transformer core design, with at least 2 years focused on amorphous metal cores.",
      "Technical Skills: Proficiency in magnetic simulation tools and understanding of core loss measurement techniques.",
      "Growth Mindset: This is a niche expertise—own it completely and help us build a world-class amorphous core capability."
    ]
  }
];

const applicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone must be less than 20 characters"),
  about: z.string().max(500, "Please keep it under 500 characters").optional(),
});

const JobCard = ({ job }: { job: JobListing }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", about: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; about?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = applicationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; phone?: string; about?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First, save to database
      const { error: dbError } = await supabase
        .from("job_applications")
        .insert({
          job_id: job.id,
          job_title: job.title,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          about: formData.about?.trim() || null,
        });

      if (dbError) throw dbError;

      // Then send email notification (non-blocking)
      supabase.functions.invoke("send-job-application", {
        body: {
          jobId: job.id,
          jobTitle: job.title,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          about: formData.about?.trim() || undefined,
        },
      }).catch((emailError: unknown) => {
        console.warn("Email notification failed (application still saved):", emailError);
      });

      toast.success("Application submitted! We'll be in touch soon.");
      setFormData({ name: "", email: "", phone: "", about: "" });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground italic">
              (Electrical & Mechanical Lead)
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-primary" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-primary" />
                {job.type}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-primary/50 text-primary">
              Engineering
            </Badge>
            <Badge variant="outline" className="border-accent/50 text-accent">
              Senior
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Summary */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Job Summary
          </h4>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {job.summary}
          </p>
        </div>

        {/* Expandable Content */}
        <Button
          variant="ghost"
          className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : "View Full Description"}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </Button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-6"
            >
              {/* Software Expert Section */}
              {job.softwareExpert && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    {job.softwareExpert.title}
                  </h4>
                  <ul className="space-y-2">
                    {job.softwareExpert.items.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  Core Responsibilities
                </h4>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-accent/30">
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Requirements
                </h4>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Apply Button */}
        <div className="pt-4 border-t border-border">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                Apply for This Position
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for {job.title}</DialogTitle>
                <DialogDescription>
                  Fill out your details and we'll be in touch soon.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about">Tell us about yourself</Label>
                  <p className="text-xs text-muted-foreground italic">
                    What makes you tick? Convince us you're not a robot. 🤖
                  </p>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    placeholder="A few sentences about what makes you awesome..."
                    className={errors.about ? "border-red-500" : ""}
                    rows={3}
                  />
                  {errors.about && <p className="text-xs text-red-500">{errors.about}</p>}
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <p className="text-xs text-muted-foreground mt-2">
            Click to submit your application details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const JobsSection = () => {
  return (
    <section id="careers" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 ranch-pattern opacity-20" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            <Briefcase className="w-3 h-3 mr-1" />
            Careers
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Join Our Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're building the future of transformer technology. Join a team of engineers and innovators 
            who are passionate about solving complex power infrastructure challenges.
          </p>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {jobListings.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* No Matching Role */}
        <div className="mt-12 text-center p-8 bg-card border border-border rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Don't see the right role?
          </h3>
          <p className="text-muted-foreground mb-4">
            We're always looking for talented individuals. Send us your resume and let us know how you can contribute.
          </p>
          <Button
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
          >
            Get in Touch
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JobsSection;
