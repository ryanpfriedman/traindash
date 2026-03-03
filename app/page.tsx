import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, BrainCircuit, Globe, BookOpen, CheckCircle, ShieldCheck, PlayCircle, ChevronDown } from 'lucide-react';
import SupportChatbot from '@/components/SupportChatbot';
import FooterChatTrigger from '@/components/FooterChatTrigger';
import { faqData } from '@/data/faq';

export default function MarketingLandingPage() {
    return (
        <div className="min-h-screen bg-[#050B14] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Top Navigation */}
            <nav className="w-full absolute top-0 z-50 px-6 py-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
                <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="TrainDash Logo" width={44} height={44} className="rounded-xl object-contain bg-white/5 p-1 border border-white/10" />
                    <span className="text-xl font-bold tracking-tight text-white hidden sm:block">TrainDash<span className="text-indigo-400">.io</span></span>
                </div>
                <div>
                    <Link href="/dashboard" className="px-6 py-2.5 rounded-full text-sm font-medium bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-all text-slate-200">
                        Login / Dashboard
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
                {/* Animated Gradient Orbs & Grid Pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-60 mix-blend-color-dodge z-0 pointer-events-none" />
                <div className="glow-orb top-[-10%] left-[-10%]" />
                <div className="glow-orb bottom-[-20%] right-[-10%]" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(59,130,246,0.1) 40%, transparent 70%)', animationDelay: '-7s' }} />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" />

                <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 z-10 shadow-indigo-500/10 hover:shadow-indigo-500/30 transition-shadow">
                    <Zap size={16} className="text-amber-400 fill-amber-400 animate-pulse" />
                    <span>TrainDash Cloud Platform is now live</span>
                </div>

                <h1 className="relative z-10 text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 max-w-4xl leading-tight mb-8 drop-shadow-2xl">
                    Deploy AI-Powered <br className="hidden md:block" /> Training in Minutes.
                </h1>

                <p className="relative z-10 text-lg md:text-xl text-slate-400 max-w-2xl font-light mb-12">
                    Upload your PDFs and let our enterprise AI generate stunning slide decks, interactive chat simulations, and scored assessments instantly.
                </p>

                <div className="relative z-10 flex gap-4 items-center mb-20">
                    <Link href="/dashboard" className="group px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center gap-2 border border-indigo-400/30">
                        Get Started
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Added Copy Instead of Hero Image */}
                <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-4 group perspective-1000">
                    <div className="p-8 rounded-3xl glass-card transition-all duration-500 hover:-translate-y-2 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                            <span className="text-indigo-300 font-bold text-xl">1</span>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-3">Upload Source Material</h3>
                        <p className="text-slate-400 leading-relaxed font-light">Instantly parse thick employee handbooks, compliance manuals, and SOPs into structured, actionable training data.</p>
                    </div>
                    <div className="p-8 rounded-3xl glass-card transition-all duration-500 hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                            <span className="text-purple-300 font-bold text-xl">2</span>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-3">AI Generation</h3>
                        <p className="text-slate-400 leading-relaxed font-light">Our enterprise models automatically design chapter-based slide decks, speaker notes, and interactive scenario quizzes.</p>
                    </div>
                    <div className="p-8 rounded-3xl glass-card transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                            <span className="text-emerald-300 font-bold text-xl">3</span>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-3">One-Click Distribution</h3>
                        <p className="text-slate-400 leading-relaxed font-light">Deploy secure web links instantly. No clumsy learner logins required. Frictionless access for your entire global team.</p>
                    </div>
                </div>
            </section>

            {/* Visual Feature: AI Generation */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-800/50">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                            <BrainCircuit size={28} className="text-indigo-400" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold">Automated Content Creation</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Stop spending weeks building dry PowerPoint slides. Drop your manuals or SOPs into TrainDash, and our AI will automatically parse the data, structure the narrative, and generate full multi-modal courses complete with text-to-speech speaker notes.
                        </p>
                        <ul className="space-y-3 pt-4">
                            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-indigo-500" size={20} /> Slideshows & Manuals</li>
                            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-indigo-500" size={20} /> Chapter-by-chapter Quizzes</li>
                            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-indigo-500" size={20} /> Lifelike AI Voiceovers</li>
                        </ul>
                    </div>
                    <div className="flex-1 w-full space-y-6">
                        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
                            <h3 className="text-xl font-bold text-white mb-3">Say Goodbye to Manual Formatting</h3>
                            <p className="text-slate-400 leading-relaxed mb-4">
                                The days of copy-pasting text from PDFs into PowerPoint are over. TrainDash's generation engine understands the context of your source documents, summarizing complex topics into digestible bullet points, extracting key vocabulary, and ensuring your brand colors are applied perfectly without lifting a finger.
                            </p>
                            <p className="text-slate-400 leading-relaxed font-semibold text-indigo-400">
                                Cut your course development time from 3 weeks down to 3 minutes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Visual Feature: Learner View & Simulations */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-800/50">
                <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                    <div className="flex-1 space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <BookOpen size={28} className="text-emerald-400" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold">Frictionless Distribution</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Generating the content is only half the battle. TrainDash eliminates learner login friction. Click "Share Link", and your learners can instantly jump into interactive chat simulations, take quizzes, and study cards—right in their mobile or desktop browser.
                        </p>
                        <ul className="space-y-3 pt-4">
                            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-emerald-500" size={20} /> One-click Web Links</li>
                            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-emerald-500" size={20} /> Scenario Chat Roleplay Simulation</li>
                            <li className="flex items-center gap-3 text-slate-300"><CheckCircle className="text-emerald-500" size={20} /> Instant Knowledge Checks</li>
                        </ul>
                    </div>
                    <div className="flex-1 w-full space-y-6">
                        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
                            <h3 className="text-xl font-bold text-white mb-3">No Clunky LMS Integrations</h3>
                            <p className="text-slate-400 leading-relaxed mb-4">
                                Traditional Learning Management Systems force users through tedious account creation flows before they can access a single slide. TrainDash generates secure, un-guessable web URLs for every course you publish.
                            </p>
                            <p className="text-slate-400 leading-relaxed">
                                Text the link to your team on Slack, drop it in an onboarding email, or embed it in an internal wiki page. When they click it, the high-performance Next.js application boots instantly in their browser with your custom branding.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto border-t border-slate-800/50">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-slate-400 text-lg">Everything you need to know about the product and billing.</p>
                </div>

                <div className="space-y-4">
                    {faqData.map((faq, idx) => (
                        <details key={idx} className="group bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                            <summary className="px-6 py-5 flex items-center justify-between cursor-pointer text-lg font-semibold text-white hover:bg-slate-800/40 transition-colors">
                                {faq.question}
                                <span className="transition group-open:rotate-180">
                                    <ChevronDown size={20} className="text-indigo-400" />
                                </span>
                            </summary>
                            <div className="px-6 pb-5 text-slate-400 leading-relaxed border-t border-slate-700/30 pt-4 bg-slate-900/50">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 px-6 md:px-12 bg-slate-900 border-t border-slate-800/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
                    <div className="flex-1 md:pr-12 text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
                        <p className="text-slate-400 text-lg mb-8">Deploy enterprise-grade training infrastructure for a fraction of traditional LMS costs. Built to scale with your team.</p>

                        <ul className="space-y-4 inline-block text-left mx-auto md:mx-0">
                            {['Unlimited AI Course Generations', 'Unlimited Learner Distrubition Links', 'Interactive Chat Simulations', 'Automated Quizzing & Analytics', 'Custom Brand Colors & Logos'].map(feature => (
                                <li key={feature} className="flex items-center gap-3 text-slate-300 font-medium">
                                    <CheckCircle size={20} className="text-indigo-400" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1 w-full max-w-md mx-auto md:mx-0">
                        <div className="bg-[#050B14] rounded-3xl p-8 border border-slate-700 shadow-2xl relative mb-6">
                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-bl-xl rounded-tr-3xl uppercase tracking-wide">
                                Creator Pro
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Professional Subscription</h3>
                            <p className="text-slate-400 text-sm mb-6">For teams serious about automating their training programs.</p>
                            <div className="flex items-baseline justify-center md:justify-start gap-2 mb-8">
                                <span className="text-6xl font-extrabold text-white">$49</span>
                                <span className="text-slate-500 font-medium text-lg">/mo</span>
                            </div>

                            <Link href="/dashboard" className="w-full block text-center py-4 rounded-xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition-colors mb-4 shadow-lg shadow-white/10">
                                Subscribe Now
                            </Link>

                            <ul className="text-left space-y-3 mb-6 relative z-10">
                                <li className="flex items-start gap-2 text-slate-300 text-sm">
                                    <BrainCircuit size={16} className="text-purple-400 mt-0.5" />
                                    <span><strong>BYOK Architecture:</strong> Bring your own OpenAI API key. Only pay OpenAI for the exact tokens you consume.</span>
                                </li>
                            </ul>

                            <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-1 mt-4">
                                <ShieldCheck size={14} /> Secure payments processed by Stripe
                            </p>
                        </div>

                        {/* Affiliate CTA (Hidden pending Clickbank Setup)
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center">
                            <h4 className="text-white font-bold mb-2">Have an audience?</h4>
                            <p className="text-sm text-slate-400 mb-4">Join our JVZoo/Clickbank partner program and earn 50% recurring commissions on every sale.</p>
                            <Link href="mailto:partners@traindash.io" className="text-indigo-400 font-semibold text-sm hover:text-indigo-300 transition-colors">
                                Become an Affiliate &rarr;
                            </Link>
                        </div>
                        */}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 px-6 text-center border-t border-slate-800/50 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
                <h2 className="text-4xl font-bold mb-6 text-white relative z-10">Ready to transform your onboarding?</h2>
                <p className="text-slate-400 text-lg mb-8 relative z-10">Join the creators mapping their knowledge to the cloud with TrainDash.</p>
                <Link href="/dashboard" className="inline-flex px-10 py-4 rounded-full bg-indigo-500 text-white font-bold text-lg hover:bg-indigo-600 transition-all relative z-10 shadow-xl shadow-indigo-500/20">
                    Get Started Today
                </Link>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 md:px-12 border-t border-slate-800 text-slate-500 text-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Image src="/logo.png" alt="TrainDash Logo" width={28} height={28} className="rounded-lg object-contain opacity-70 grayscale hover:grayscale-0 transition-all" />
                        <span className="font-bold text-slate-400 text-base">TrainDash.io</span>
                    </div>

                    <div className="flex gap-6">
                        <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                        <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
                        <FooterChatTrigger />
                        {/* <Link href="mailto:partners@traindash.io" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">Affiliates (Earn 50%)</Link> */}
                    </div>

                    <p>© {new Date().getFullYear()} TrainDash.io. All rights reserved.</p>
                </div>
            </footer>

            {/* Floating Support Chatbot */}
            <SupportChatbot />
        </div>
    );
}
