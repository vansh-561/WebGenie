function Footer() {
  return (
    <footer className="bg-gradient-to-t from-gray-900 to-gray-950 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">

          <div className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-xl font-bold text-blue-200">Webgenie</h3>
            <p className="text-blue-100 text-sm mt-1">Create stunning websites in minutes</p>
          </div>

          <div className="flex gap-8">
            <a href="/" className="text-white hover:text-blue-200 transition-colors">Home</a>
            <a href="/dashboard" className="text-white hover:text-blue-200 transition-colors">Dashboard</a>
          </div>
        </div>

        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm text-blue-100">© {new Date().getFullYear()} Webgenie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer