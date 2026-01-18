import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';

interface HeaderProps {
    onSearch: (query: string) => void;
    onClear: () => void;
}

export default function Header({ onSearch, onClear }: HeaderProps) {
    const handleLogoClick = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="header-left">
                        <div
                            className="logo"
                            onClick={handleLogoClick}
                            style={{ cursor: 'pointer' }}
                        >
                            rudra&apos;s corner
                        </div>
                        <ThemeToggle />
                    </div>

                    <SearchBar onSearch={onSearch} onClear={onClear} />
                </div>
            </div>
        </header>
    );
}
