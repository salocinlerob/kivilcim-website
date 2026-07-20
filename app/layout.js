import './globals.css';

export const metadata = {
  title: 'Kivilcim S. Güngorün',
  description: 'Photography',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
