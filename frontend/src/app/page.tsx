/**
 * Home Page
 * 
 * Landing page for Janta Pharmacy.
 * TODO: Add hero section
 * TODO: Add featured products
 * TODO: Add promotional content
 */
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Janta Pharmacy</h1>
      <p>Your trusted partner for pharmaceutical needs.</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>Quick Links</h2>
        <ul>
          <li>Browse Products (coming soon)</li>
          <li>View Orders</li>
          <li>Upload Prescription (coming soon)</li>
        </ul>
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🏗️ Development Mode</h3>
        <p>This is the frontend scaffolding. Features are being implemented progressively.</p>
      </section>
    </div>
  );
}

