import styles from './Whychoose.module.css'

const sections = [
  {
    heading: 'Why Businesses in Nigeria and Ghana Choose Promallshop',
    bullets: [
      'Genuine products from trusted global technology brands',
      'A wide range of IT equipment for businesses and organizations',
      'High-quality computer accessories for productivity and communication',
      'Competitive pricing on advanced technology products',
      'Reliable technology solutions for offices, schools, and institutions',
      'Access to modern collaboration and communication tools',
    ],
    text: 'Our goal is to help businesses and professionals adopt modern technology solutions that improve productivity, communication, and efficiency.',
  },
  {
    heading: 'Video Conferencing Solutions for Modern Workplaces',
    bullets: [
      'Conference cameras and HD webcams',
      'Professional microphones and speakerphones',
      'All-in-one video conferencing systems',
      'Meeting room collaboration devices',
    ],
    text: 'We supply equipment from trusted brands such as Logitech, Polycom, Yealink, Norden, and Vbet, ensuring crystal-clear audio and high-definition video communication for meetings, training sessions, and remote collaboration. These solutions are ideal for corporate boardrooms, training rooms, remote teams, and government organizations.',
  },
  {
    heading: 'Coding and Robotics Kits for STEM Learning',
    bullets: [
      'Makeblock robotics and coding kits',
      'Twin Robotics educational tools',
      'Arduino starter and advanced kits',
    ],
    text: 'These tools help students develop valuable skills in coding, robotics engineering, automation, electronics, and creative problem solving. They are perfect for schools, STEM academies, coding bootcamps, and technology training centers.',
  },
  {
    heading: 'Interactive Displays and Digital Signage Screens',
    bullets: [
      'Multi-touch interactive displays',
      'Wireless presentation systems',
      'Digital signage screens for retail and corporate communication',
      'Smart collaboration displays for meetings and classrooms',
    ],
    text: 'We supply innovative display technology from trusted brands such as Samsung, MAXHUB, LG, and Sharp, enabling organizations to deliver engaging presentations, collaborative learning experiences, and modern workplace communication.',
  },
  {
    heading: 'Computer Accessories for Offices and Home Workspaces',
    bullets: [
      'Professional headsets for meetings and calls',
      'High-definition webcams',
      'Wireless keyboards and precision mice',
      'USB hubs and connectivity adapters',
      'Laptop accessories and computer peripherals',
    ],
    text: 'These accessories are ideal for corporate offices, remote workers, home workspaces, and professionals who require reliable productivity tools.',
  },
  {
    heading: 'Networking, Security, and Power Solutions',
    bullets: [
      'Networking equipment and enterprise routers',
      'Surveillance cameras and security systems',
      'Backup power solutions',
      'Office connectivity and network devices',
    ],
    text: 'These solutions ensure businesses maintain secure networks, reliable connectivity, and uninterrupted operations.',
  },
]

export default function Choose() {
  return (
    <div className={styles.container}>
      <h2>Promallshop — No. 1 Shopping Destination For IT Solutions</h2>
      <p className={styles.intro}>
        Welcome to <strong>Promallshop</strong>, a trusted <strong>tech store for IT equipment and computer accessories in Nigeria and Ghana</strong>.
        We provide advanced technology solutions designed for businesses, schools, government organizations, and individuals
        who need reliable digital tools for productivity and communication.
      </p>

      {sections.map((s) => (
        <div key={s.heading} className={styles.choices}>
          <h3 className={styles.header}>{s.heading}</h3>
          <ul className={styles.margin}>
            {s.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p>{s.text}</p>
        </div>
      ))}

      <div className={styles.choices}>
        <h3 className={styles.header}>Enjoy 15% Off Your First Order</h3>
        <p>
          New customers can enjoy an exclusive <strong>15% discount on their first purchase at Promallshop</strong> — 
          on video conferencing systems, interactive displays, robotics kits, computer accessories, networking equipment, and more.
          Promallshop offers premium technology products at competitive prices for businesses, schools, and professionals across Nigeria and Ghana.
        </p>
      </div>

      <div className={styles.choices} style={{ marginBottom: '2em' }}>
        <h3 className={styles.header}>Our Trusted Technology Partners</h3>
        <p>
          Promallshop collaborates with leading global technology brands including <strong>MAXHUB, Huawei, Logitech, Yealink, Samsung, LG, Sharp, Bosch, Polycom, Sennheiser, Absen, Hikvision, Twin Robotics, Makeblock, and Arduino</strong> to ensure customers receive genuine IT equipment and high-quality computer accessories backed by global quality standards and trusted manufacturer support.
        </p>
      </div>
    </div>
  )
}
