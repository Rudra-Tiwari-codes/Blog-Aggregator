const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-4">
              Blog Aggregator
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              An AI-powered platform that brings together the best blog posts from 
              Medium and Blogger, with intelligent summaries and personalized recommendations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="/" 
                  className="hover:text-primary-400 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="#categories" 
                  className="hover:text-primary-400 transition-colors"
                >
                  Categories
                </a>
              </li>
              <li>
                <a 
                  href="#about" 
                  className="hover:text-primary-400 transition-colors"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-4">
              Sources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://medium.com/@rudragod5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors flex items-center space-x-2"
                >
                  <span>Medium</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://rudra-tiwari-blogs.blogspot.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary-400 transition-colors flex items-center space-x-2"
                >
                  <span>Blogger</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Blog Aggregator. Built with AI and love.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-xs text-gray-500 flex items-center space-x-1">
              <span>Powered by</span>
              <span className="text-primary-400 font-semibold">OpenAI</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
