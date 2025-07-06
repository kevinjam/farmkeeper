import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-heading font-bold text-primary-600">FarmKeeper</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="/#features" className="hover:text-primary-600">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-primary-600">Pricing</Link></li>
              <li><Link href="/auth/login" className="btn btn-primary">Login</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Manage Your Farm Smarter in Uganda</h2>
            <p className="text-lg mb-8">Complete farm management solution for Ugandan farmers to track livestock, crops, finances, and resources.</p>
            <div className="flex space-x-4">
              <Link href="/auth/register" className="btn btn-primary">Start Free Trial</Link>
              <Link href="/#features" className="btn border border-gray-300 dark:border-gray-700">Learn More</Link>
            </div>
          </div>
          <div className="md:w-1/2">
            {/* Placeholder for hero image */}
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 w-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Record Management</h3>
              <p>Keep track of all your farming operations, including crop and livestock records, in one central location.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Financial Tracking</h3>
              <p>Manage your farm finances, including expenses and income, in real-time to make informed financial decisions.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Resource Management</h3>
              <p>Optimize your resources, including labor and equipment, by tracking usage and schedules.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Data Analytics</h3>
              <p>Gain insights into your farm operations with real-time data analytics and customizable reporting.</p>
            </div>
            
            {/* Feature 5 */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Feed Management</h3>
              <p>Keep track of feed usage and inventory, and manage feeding schedules for all your poultry.</p>
            </div>
            
            {/* Feature 6 */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Weather Management</h3>
              <p>Get local weather forecasts and alerts to help plan your farming activities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pricing Plan 1 */}
            <div className="card border-t-4 border-t-primary-500">
              <h3 className="text-xl font-bold mb-2">Basic</h3>
              <p className="text-3xl font-bold mb-4">UGX 50,000<span className="text-sm font-normal">/month</span></p>
              <ul className="mb-6 space-y-2">
                <li>Up to 50 livestock records</li>
                <li>Basic financial tracking</li>
                <li>1 user account</li>
                <li>Mobile access</li>
              </ul>
              <Link href="/auth/register?plan=basic" className="btn btn-primary block text-center">Get Started</Link>
            </div>
            
            {/* Pricing Plan 2 */}
            <div className="card border-t-4 border-t-secondary-500 transform scale-105 shadow-lg">
              <div className="absolute top-0 right-0 bg-secondary-500 text-white px-3 py-1 text-sm rounded-bl-lg">Popular</div>
              <h3 className="text-xl font-bold mb-2">Standard</h3>
              <p className="text-3xl font-bold mb-4">UGX 100,000<span className="text-sm font-normal">/month</span></p>
              <ul className="mb-6 space-y-2">
                <li>Unlimited livestock records</li>
                <li>Advanced financial tracking</li>
                <li>3 user accounts</li>
                <li>Data analytics</li>
                <li>Weather alerts</li>
              </ul>
              <Link href="/auth/register?plan=standard" className="btn btn-secondary block text-center">Get Started</Link>
            </div>
            
            {/* Pricing Plan 3 */}
            <div className="card border-t-4 border-t-primary-500">
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <p className="text-3xl font-bold mb-4">UGX 200,000<span className="text-sm font-normal">/month</span></p>
              <ul className="mb-6 space-y-2">
                <li>Unlimited records</li>
                <li>Complete financial suite</li>
                <li>10 user accounts</li>
                <li>Advanced analytics & reporting</li>
                <li>Priority support</li>
                <li>Custom integrations</li>
              </ul>
              <Link href="/auth/register?plan=premium" className="btn btn-primary block text-center">Get Started</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FarmKeeper</h3>
              <p>Complete farm management solution for Ugandan farmers.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2">
                <li><Link href="/#features" className="hover:text-primary-400">Record Management</Link></li>
                <li><Link href="/#features" className="hover:text-primary-400">Financial Tracking</Link></li>
                <li><Link href="/#features" className="hover:text-primary-400">Resource Management</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-primary-400">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary-400">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-primary-400">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-primary-400">support@farmkeeper.com</Link></li>
                <li><Link href="#" className="hover:text-primary-400">+256 700 123456</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} FarmKeeper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
