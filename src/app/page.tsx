import Link from 'next/link';
import {
  Upload,
  Camera,
  Shield,
  AlertCircle,
  FileText,
  Clock,
  Download,
  Share2,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950" />

        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Prescription Reader
            </div>

            {/* Main headline - EXACT as specified */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Turn prescriptions into<br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                clear notes in seconds.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
              Upload a photo of your prescription and get clear medication instructions you can read and share.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/upload"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
              >
                <Upload className="w-5 h-5" />
                Upload Prescription
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/upload?camera=true"
                className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-lg border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </Link>
            </div>

            {/* Trust Chips */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy-first</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Highlights unclear items</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Not medical advice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Three simple steps to understand your prescription
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400">
                1
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/30 rounded-2xl p-8 pt-10 h-full card-hover">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-6">
                  <Camera className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Upload or Take Photo
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Snap a photo of your prescription or upload an existing image/PDF. Supports multiple pages.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400">
                2
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/30 rounded-2xl p-8 pt-10 h-full card-hover">
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Review & Fix
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check the extracted medications. Confirm or correct any unclear items flagged by our AI.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-xl font-bold text-purple-600 dark:text-purple-400">
                3
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-pink-900/30 rounded-2xl p-8 pt-10 h-full card-hover">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Get Clear Notes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Receive easy-to-read notes with medication schedule, instructions, and downloadable PDF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What you get
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to understand your medications
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Plain-language summary', desc: 'Easy to understand medication instructions' },
              { icon: Clock, title: 'Medication schedule', desc: 'Morning, afternoon, and night timing' },
              { icon: AlertCircle, title: 'Duration & food instructions', desc: 'How long and when to take each medicine' },
              { icon: Shield, title: 'Warnings & precautions', desc: 'General safety information highlighted' },
              { icon: Download, title: 'Download as PDF', desc: 'Save or print your medication notes' },
              { icon: Share2, title: 'Share with family', desc: 'Easily share notes with caregivers' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 card-hover"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Disclaimer Section */}
      <section className="py-16 bg-amber-50 dark:bg-amber-950/30 border-y border-amber-100 dark:border-amber-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-3">
                Important Information
              </h3>
              <ul className="space-y-2 text-amber-800 dark:text-amber-200">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  PrescriptoAI helps you understand what&apos;s written on a prescription.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  It does <strong>not</strong> provide medical advice.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  Always confirm with your doctor or pharmacist, especially for children, pregnancy, chronic illness, or high-risk medications.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Your Privacy Matters
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Uploads are processed securely over HTTPS
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  You can delete your results anytime
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  We don&apos;t sell your data
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Data automatically deleted after 24 hours
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to convert your prescription?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Get clear, easy-to-understand medication notes in seconds.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white hover:bg-gray-100 text-indigo-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            <Upload className="w-5 h-5" />
            Upload Prescription
          </Link>
        </div>
      </section>
    </div>
  );
}
