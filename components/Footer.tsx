export default function Footer() {
  return (
    <footer
      style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--silver)',
        fontFamily: 'var(--font-accent)',
        fontSize: '0.9rem',
        borderTop: '1px solid var(--steel)',
        marginTop: '4rem',
      }}
    >
      <p>built with caffeine &amp; curiosity by rudra</p>
      <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>
        pulling thoughts from medium &amp; blogspot
      </p>
    </footer>
  );
}
