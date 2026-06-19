import { useState, useEffect } from "react"
import styles from '../components/Description.module.css'
export default function Description (){
    const [activeSolution, setActiveSolution] = useState("description");

const productInfo = {
    description: {
      title: 'Description',
      leftColumn: [
        {
          text: "With a dual-camera system and RightSight 2 auto-framing technology, Rally Bar welcomes remote participants to the conversation. Choose Grid View to eliminate empty space and frame each person in their own stream, Speaker View to highlight the active speaker, or Group View to capture everyone in the room."
        },
        {
          heading: "LOOKS BRILLIANT",
          text: "An innovative dual-camera system with optical zoom and an AI Viewfinder delivers fluid, cinematic video in medium and large rooms."
        },
        {
          heading: "SOUNDS AWESOME",
          text: "Rally Bar's advanced audio engineering delivers powerful, room-filling sound and makes sure every voice is clearly heard."
        },
        {
          heading: "SIMPLE TO MANAGE",
          text: "Easily manage your Logitech video collaboration devices with Logitech Sync. Monitor room health, deploy updates, and modify settings all from a single cloud-based platform. And with Sync Insights, you can see how meeting spaces are utilized over time."
        }
      ],
      rightColumn: [
        {
          heading: "SPECS & DETAILS",
          subheading: "DIMENSIONS",
          text: "Height: 164 mm\nWidth: 910 mm\nDepth: 130.5 mm\nLens Depth: 28.8 mm\nWeight: 7.08 kg"
        },
        {
          heading: "COMPATIBILITY",
          text: "Internet Connection: Wired or wireless\nUSB Mode: Windows® 11, Windows 10, the two most recent versions of macOS\nAppliance Mode: Room solution software license (not included)"
        }
      ]
    },
    general: {
      title: 'General Specifications',
      leftColumn: [
        {
          text: "Built-in Components: 6 beamforming microphones, PTZ camera, 2 speakers, AI Viewfinder, cable management & retention system, table stand, Logitech CollabOS platform\nEnclosure: All-in-one enclosure with integrated table stand and patented speaker suspension system to eliminate vibration-induced camera shake and audio interference\nDevice Management: Logitech Sync\nDisplays Supported: 2 (up to 1080p)\nDisplay Resolution: Up to 1080p\nNetwork Protocol Support: IPv4, IPv6\nProxy Support: IP based Proxy, FQDN based Proxy, Proxy using PAC file"
        },
        {
          heading: "Speakers",
          text: "Drivers: 2x 70 mm\nSensitivity: 92 dB SPL @1W, 99dB SPL @8.0W, both +/-2dB at ½ meter\nRated Power: 8W\nTHD: 1kHz <2% at 1W\nSpeaker Sampling Rate: 48 kHz\nImpedance: 4 Ohms"
        }
      ],
      rightColumn: [
        {
          heading: "Camera",
          text: "Resolution: 4K, 1440p, 1080p, 900p, 720p, and SD at 30fps\nPan: Motorized ±25°\nTilt: Motorized ±15°\nZoom: 15X HD zoom (5X optical and 3X digital)\nDiagonal Field of View: 90°\nHorizontal Field of View: 82.1°\nVertical Field of View: 52.2°\nTotal Room Coverage (field of view + pan and tilt): 132.1° Horizontal x 82.2° Vertical"
        },
        {
          heading: "Microphones",
          text: "Frequency Response: 90Hz – 16kHz\nSensitivity: >-36dBFS +/-1 dB @ 1Pa\nMicrophone data rate output: 48KHz\nPickup Range: Up to 7 m\nBeamforming Elements: Six omnidirectional digital MEMS microphones forming five adaptive acoustic broadside beams\nAudio processing: AEC (Acoustic Echo Cancellation), VAD (Voice Activity Detector)\nNoise suppression: AI based de-noising algorithm\nAdd-on Mics: Supports up to 4 additional Rally Mic Pods and 2 Rally Mic Pod Hubs for larger conference rooms"
        }
      ]
    },
    technical: {
      title: 'Technical Specifications',
      leftColumn: [{ heading: "Technical Parameters", text: "Details coming soon..." }],
      rightColumn: [{ heading: "Hardware", text: "Details coming soon..." }]
    },
    support: {
      title: 'Support',
      leftColumn: [{ heading: "Downloads", text: "Manuals and firmware utilities..." }],
      rightColumn: [{ heading: "Warranty", text: "2-year limited hardware warranty details..." }]
    }
  };
  const currentTab = productInfo[activeSolution];
    return(
        <>

        <div className={styles.container}>
         <div className={styles.buttons}>
               {Object.keys(productInfo).map((key) => (
                  <button
                    style={{
                      whiteSpace: "nowrap",
                    }}
                    key={key}
                    className={` ${activeSolution === key ? styles.active : styles.panelBtn}`}
                    onClick={() => setActiveSolution(key)}
                  >
                   {productInfo[key].title}
                  </button>
                ))}
         </div>
     {/* Main Grid Content Area */}
      <div className={styles.gridContent}>
        {/* Left Column */}
        <div className={styles.column}>
          {currentTab.leftColumn.map((item, idx) => (
            <div key={idx} className={styles.sectionBlock}>
              {item.heading && <h3 className={styles.blockHeading}>{item.heading}</h3>}
              {item.subheading && <h4 className={styles.blockSubheading}>{item.subheading}</h4>}
              <p className={styles.blockText}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className={styles.column}>
          {currentTab.rightColumn.map((item, idx) => (
            <div key={idx} className={styles.sectionBlock}>
              {item.heading && <h3 className={styles.blockHeading}>{item.heading}</h3>}
              {item.subheading && <h4 className={styles.blockSubheading}>{item.subheading}</h4>}
              <p className={styles.blockText}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}