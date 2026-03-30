const Footer = () => {
    return (
        <footer className="bg-neutral-900 text-neutral-400 py-12 border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div 
                    className="flex items-center cursor-pointer text-white transition-opacity hover:opacity-80" 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <span className="text-2xl font-bold tracking-tight">Arrange Box</span>
                </div>
                <div className="flex gap-8 text-sm font-medium">
                    <a href="#" className="hover:text-white transition-colors">이용약관</a>
                    <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
                    <a href="#" className="hover:text-white transition-colors">문의하기</a>
                </div>
                <div className="text-sm">
                    © {new Date().getFullYear()} Arrange Box. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;