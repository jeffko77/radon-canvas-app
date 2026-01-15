import './Solutions.css'

export default function Solutions() {
  const testingSolutions = [
    {
      id: '1',
      title: 'Short-Term Testing (2-7 days)',
      description: 'Quick screening tests to get initial radon levels. Perfect for initial assessments.',
      details: [
        'Activated charcoal canisters',
        'Alpha track detectors',
        'Electret ion chambers',
        'Typically placed in lowest livable area',
        'Windows and doors should remain closed during test',
      ],
      pros: ['Fast results', 'Lower cost', 'Good for initial screening'],
      cons: ['Less accurate than long-term tests', 'Weather dependent'],
      cost: '$15 - $50',
    },
    {
      id: '2',
      title: 'Long-Term Testing (90+ days)',
      description: 'More accurate annual average radon levels. Recommended for comprehensive assessment.',
      details: [
        'Alpha track detectors',
        'Electret ion chambers',
        'Continuous radon monitors',
        'Provides year-round average exposure',
        'Accounts for seasonal variations',
      ],
      pros: ['Most accurate', 'Accounts for seasonal changes', 'Better for decision-making'],
      cons: ['Takes longer to get results', 'Higher cost'],
      cost: '$30 - $150',
    },
    {
      id: '3',
      title: 'Continuous Monitoring',
      description: 'Real-time radon monitoring with digital displays. Ideal for ongoing assessment.',
      details: [
        'Digital radon monitors',
        '24/7 monitoring capability',
        'Can track daily and monthly averages',
        'Easy to move between rooms',
        'Some models connect to smartphone apps',
      ],
      pros: ['Real-time data', 'Track variations over time', 'Reusable'],
      cons: ['Higher upfront cost', 'Requires calibration'],
      cost: '$150 - $500',
    },
    {
      id: '4',
      title: 'Professional Testing Services',
      description: 'Certified professionals perform testing and provide detailed reports.',
      details: [
        'State-certified or nationally certified testers',
        'EPA protocol compliance',
        'Detailed reports with recommendations',
        'May include home inspection',
        'Often includes consultation',
      ],
      pros: ['Professional expertise', 'Compliant testing', 'Detailed reporting'],
      cons: ['Higher cost', 'Scheduling required'],
      cost: '$100 - $300',
    },
  ]

  const remediationSolutions = [
    {
      id: '1',
      title: 'Active Soil Depressurization (ASD)',
      description: 'The most common and effective method. Uses a fan to draw radon from beneath the foundation and vent it outside.',
      details: [
        'Suction pipe inserted through foundation',
        'Electric fan creates negative pressure',
        'Radon vented above roofline',
        'Effective for most homes',
        'Can reduce radon by 80-99%',
      ],
      pros: ['Very effective', 'Proven method', 'Works in most homes'],
      cons: ['Requires professional installation', 'Uses electricity'],
      cost: '$800 - $2,500',
      installation: 'Professional recommended',
    },
    {
      id: '2',
      title: 'Sub-Slab Depressurization',
      description: 'Best for homes with concrete slab foundations. Creates negative pressure zone under slab.',
      details: [
        'Hole drilled through concrete slab',
        'Fan draws air from beneath slab',
        'Pipes vent radon above roof',
        'Most effective for slab-on-grade homes',
      ],
      pros: ['Highly effective for slab foundations', 'Long-lasting solution'],
      cons: ['Requires slab penetration', 'Professional installation needed'],
      cost: '$1,200 - $2,500',
      installation: 'Professional required',
    },
    {
      id: '3',
      title: 'Drain Tile Depressurization',
      description: 'Utilizes existing foundation drain systems to extract radon from soil.',
      details: [
        'Connects to existing perimeter drains',
        'Fan draws air from drain system',
        'Can be very effective if drains are well-sealed',
        'No need to penetrate foundation',
      ],
      pros: ['Uses existing infrastructure', 'Less invasive'],
      cons: ['Requires sealed drain system', 'May need modifications'],
      cost: '$900 - $2,000',
      installation: 'Professional recommended',
    },
    {
      id: '4',
      title: 'Sump Pit Depressurization',
      description: 'For homes with sump pumps. Seals sump pit and vents air from it.',
      details: [
        'Seal sump pit with airtight cover',
        'Fan extracts air from sump',
        'Very effective if sump is main entry point',
        'Easy to maintain',
      ],
      pros: ['Uses existing sump system', 'Relatively simple'],
      cons: ['Only works if sump is radon entry point', 'Sump must be sealed'],
      cost: '$800 - $1,500',
      installation: 'Professional recommended',
    },
    {
      id: '5',
      title: 'Block Wall Depressurization',
      description: 'For homes with hollow block foundations. Depressurizes interior of block walls.',
      details: [
        'Holes drilled into block wall interior',
        'Fan creates negative pressure in walls',
        'Effective for block foundation homes',
        'Radon vented outside',
      ],
      pros: ['Effective for block foundations', 'Comprehensive solution'],
      cons: ['Requires multiple connection points', 'More complex'],
      cost: '$1,500 - $3,000',
      installation: 'Professional required',
    },
    {
      id: '6',
      title: 'Crawlspace Depressurization',
      description: 'For homes with crawlspaces. Seals and depressurizes crawlspace area.',
      details: [
        'Seal crawlspace vents and gaps',
        'Fan creates negative pressure in crawlspace',
        'Prevents radon entry into home',
        'May include vapor barrier',
      ],
      pros: ['Addresses crawlspace entry points', 'Can improve air quality'],
      cons: ['Requires crawlspace sealing', 'Regular maintenance needed'],
      cost: '$1,000 - $2,500',
      installation: 'Professional recommended',
    },
    {
      id: '7',
      title: 'Natural Ventilation',
      description: 'Simple method using increased ventilation to dilute radon levels.',
      details: [
        'Open windows and doors regularly',
        'Install exhaust fans',
        'Increase air exchange rate',
        'Better for basements and lower levels',
      ],
      pros: ['Low cost', 'Simple approach', 'No special equipment'],
      cons: ['Less effective', 'Energy inefficient', 'Not a permanent solution'],
      cost: '$0 - $500',
      installation: 'DIY possible',
    },
    {
      id: '8',
      title: 'Sealing Cracks and Openings',
      description: 'Reduces radon entry points by sealing foundation cracks and gaps.',
      details: [
        'Seal foundation cracks',
        'Close gaps around pipes',
        'Seal sump pits',
        'Seal crawlspace openings',
      ],
      pros: ['Part of comprehensive solution', 'Relatively low cost'],
      cons: ['Not effective alone', 'Needs regular maintenance'],
      cost: '$100 - $1,000',
      installation: 'DIY possible',
    },
  ]

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Testing & Remediation Solutions</h2>
        </div>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Comprehensive guide to radon testing methods and remediation solutions. Choose the option
          that best fits your needs and budget.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Testing Solutions</h2>
        </div>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Various testing methods available to measure radon levels in your home. The EPA recommends
          testing all homes below the third floor.
        </p>
        <div className="solutions-grid">
          {testingSolutions.map((solution) => (
            <div key={solution.id} className="solution-card">
              <div className="solution-header">
                <h3 className="solution-title">{solution.title}</h3>
                <span className="solution-cost">{solution.cost}</span>
              </div>
              <p className="solution-description">{solution.description}</p>
              <div className="solution-details">
                <h4>Details:</h4>
                <ul>
                  {solution.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
              <div className="solution-pros-cons">
                <div className="pros">
                  <h4>✓ Advantages:</h4>
                  <ul>
                    {solution.pros.map((pro, idx) => (
                      <li key={idx}>{pro}</li>
                    ))}
                  </ul>
                </div>
                {solution.cons && (
                  <div className="cons">
                    <h4>⚠ Considerations:</h4>
                    <ul>
                      {solution.cons.map((con, idx) => (
                        <li key={idx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Remediation Solutions</h2>
        </div>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          If your radon test results show levels above 4.0 pCi/L, consider these remediation
          options. The EPA recommends taking action if levels exceed 4.0 pCi/L.
        </p>
        <div className="solutions-grid">
          {remediationSolutions.map((solution) => (
            <div key={solution.id} className="solution-card">
              <div className="solution-header">
                <h3 className="solution-title">{solution.title}</h3>
                <span className="solution-cost">{solution.cost}</span>
              </div>
              <p className="solution-description">{solution.description}</p>
              <div className="solution-details">
                <h4>Details:</h4>
                <ul>
                  {solution.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
              <div className="solution-pros-cons">
                <div className="pros">
                  <h4>✓ Advantages:</h4>
                  <ul>
                    {solution.pros.map((pro, idx) => (
                      <li key={idx}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="cons">
                  <h4>⚠ Considerations:</h4>
                  <ul>
                    {solution.cons.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {solution.installation && (
                <div className="solution-installation">
                  <strong>Installation:</strong> {solution.installation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="info-box">
          <h3>📋 Important Notes</h3>
          <ul>
            <li>
              <strong>EPA Action Level:</strong> The EPA recommends taking action if radon levels
              are 4.0 pCi/L or higher. Consider action between 2.0-4.0 pCi/L.
            </li>
            <li>
              <strong>Certification:</strong> Look for certified radon professionals. Check your
              state radon program or the National Radon Proficiency Program (NRPP).
            </li>
            <li>
              <strong>Retesting:</strong> After remediation, retest to ensure the system is working
              effectively. Retest every 2 years.
            </li>
            <li>
              <strong>Maintenance:</strong> Active systems require periodic maintenance. Check fan
              operation and monitor radon levels regularly.
            </li>
            <li>
              <strong>Combination Approach:</strong> Often, the most effective solution combines
              multiple methods, such as sealing entry points and installing active depressurization.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
