const logoImg = 'https://placehold.co/40x40/orange/white?text=Logo';

const Footer = () => {
    return (
        <footer className="bg-neutral-900 text-neutral-400 py-12 border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 text-white">
                    <div className="h-8 w-8 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                        <img src={logoImg} alt="Arrange Box Logo" className="h-full w-full object-contain" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Arrange Box</span>
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