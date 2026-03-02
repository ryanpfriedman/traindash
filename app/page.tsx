import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, BrainCircuit, Globe, BookOpen, CheckCircle, ShieldCheck, PlayCircle } from 'lucide-react';

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
            <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
                    <Zap size={16} className="text-amber-400 fill-amber-400" />
                    <span>TrainDash Cloud Platform is now live</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 max-w-4xl leading-tight mb-8">
                    Deploy AI-Powered <br className="hidden md:block" /> Training in Minutes.
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-light mb-12">
                    Upload your PDFs and let our enterprise AI generate stunning slide decks, interactive chat simulations, and scored assessments instantly.
                </p>

                <div className="flex gap-4 items-center mb-20">
                    <Link href="/dashboard" className="group px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2">
                        Get Started
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Subtle Hero Image Demo */}
                <div className="relative w-full max-w-5xl mx-auto rounded-xl md:rounded-3xl border border-slate-700/50 bg-slate-800/20 p-2 md:p-4 shadow-2xl backdrop-blur-sm z-10 transition-transform hover:scale-[1.01] duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] to-transparent z-10 opacity-60 rounded-3xl pointer-events-none" />
                    <Image
                        src="/wizard_preview.png"
                        alt="TrainDash AI Course Generation Wizard"
                        width={1200} height={675}
                        className="rounded-lg md:rounded-2xl w-full h-auto object-cover shadow-2xl border border-slate-800/80"
                        priority
                    />
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
                    <div className="flex-1 w-full relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-2xl rounded-[3rem]" />
                        <Image
                            src="/dashboard_preview.png"
                            alt="TrainDash Course Management Dashboard"
                            width={800} height={600}
                            className="rounded-2xl relative z-10 border border-slate-700/50 shadow-2xl"
                        />
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
                    <div className="flex-1 w-full relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-2xl rounded-[3rem]" />
                        <Image
                            src="/learner_static.png"
                            alt="Interactive Learner View with Slide Generation"
                            width={800} height={600}
                            className="rounded-2xl relative z-10 border border-slate-700/50 shadow-2xl"
                        />
                    </div>
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
                        <div className="bg-[#050B14] rounded-3xl p-8 border border-slate-700 shadow-2xl relative">
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
                            <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-1">
                                <ShieldCheck size={14} /> Secure payments processed by Stripe
                            </p>
                        </div>
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
                    </div>

                    <p>© {new Date().getFullYear()} TrainDash.io. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
