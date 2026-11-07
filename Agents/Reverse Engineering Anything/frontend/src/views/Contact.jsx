import HelpButton from '../components/HelpButton.jsx';

export default function Contact({ ctx }) {
  return (
    <>
      <div className="welcome-row"><div><h1>Contact Us</h1><p className="home-subtitle">We are here to help.</p></div><HelpButton onHelp={ctx.openHelp} /></div>
      <section className="info-card contact-info">
        <h2>Contact details</h2>
        <p><strong>Call Center:</strong> 901</p>
        <p><strong>Email:</strong> mail@dubaipolice.gov.ae</p>
        <p><strong>P.O. Box:</strong> 1493 Dubai - United Arab Emirates</p>
        <button className="primary" id="contact-services" onClick={() => ctx.navigate('/app/services')}>Browse services</button>
      </section>
    </>
  );
}
