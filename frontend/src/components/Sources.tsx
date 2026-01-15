import './Sources.css'

export default function Sources() {
  const sources = [
    {
      id: '1',
      title: 'Missouri Radon Testing – Residential Map',
      description:
        'Interactive map showing residential radon test results across Missouri. View radon levels by location to identify high-risk areas in your region.',
      url: 'https://mohealth.maps.arcgis.com/apps/webappviewer/index.html?id=8c78df9a427a4536ab915e08f4def37d',
      category: 'Data & Maps',
      icon: '🗺️',
    },
    {
      id: '2',
      title: 'Missouri Radon Data Portal',
      description:
        'Comprehensive radon data and statistics from the Missouri Department of Health & Senior Services. View test results, housing units tested, and access additional resources.',
      url: 'https://ephtn.dhss.mo.gov/EPHTN_Data_Portal/radon/',
      category: 'Government Resources',
      icon: '📊',
    },
    {
      id: '3',
      title: 'EPA - Radon',
      description:
        'The U.S. Environmental Protection Agency provides comprehensive information about radon, including health risks, testing methods, and remediation options.',
      url: 'https://www.epa.gov/radon',
      category: 'Government Resources',
      icon: '🏛️',
    },
    {
      id: '4',
      title: 'CDC - Radon',
      description:
        'The Centers for Disease Control and Prevention offers information about radon exposure, health effects, and prevention strategies.',
      url: 'https://www.cdc.gov/radon/',
      category: 'Health Information',
      icon: '🏥',
    },
    {
      id: '5',
      title: 'CDC Environmental Public Health Tracking - Radon Testing',
      description:
        'Environmental Public Health Tracking Network provides data on radon testing across the United States, including Missouri.',
      url: 'https://ephtracking.cdc.gov/',
      category: 'Data & Maps',
      icon: '📈',
    },
    {
      id: '6',
      title: 'American Cancer Society - Radon and Cancer',
      description:
        'Information about the link between radon exposure and lung cancer, including statistics and prevention strategies.',
      url: 'https://www.cancer.org/cancer/risk-prevention/radiation-exposure/radon.html',
      category: 'Health Information',
      icon: '🎗️',
    },
    {
      id: '7',
      title: 'American Lung Association - Radon',
      description:
        'The American Lung Association provides resources about radon, its health effects, and how to protect yourself and your family.',
      url: 'https://www.lung.org/clean-air/at-home/indoor-air-pollutants/radon',
      category: 'Health Information',
      icon: '🫁',
    },
    {
      id: '8',
      title: 'National Cancer Institute - Radon and Cancer',
      description:
        'The National Institutes of Health National Cancer Institute offers research-based information about radon exposure and cancer risk.',
      url: 'https://www.cancer.gov/about-cancer/causes-prevention/risk/substances/radon',
      category: 'Health Information',
      icon: '🔬',
    },
    {
      id: '9',
      title: 'Missouri Department of Health & Senior Services - Radon Program',
      description:
        'Official Missouri radon program page with information about testing, free test kits, and local resources.',
      url: 'https://health.mo.gov/living/environment/radon/',
      category: 'Government Resources',
      icon: '🏠',
    },
  ]

  const categories = [
    ...new Set(sources.map((source) => source.category)),
  ]

  const getSourcesByCategory = (category: string) => {
    return sources.filter((source) => source.category === category)
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Resources & Sources</h2>
        </div>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Official resources and data sources for radon testing, health information, and Missouri-specific
          radon data. Use these links to access authoritative information and interactive maps.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category} className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">{category}</h2>
          </div>
          <div className="sources-grid">
            {getSourcesByCategory(category).map((source) => (
              <div key={source.id} className="source-card">
                <div className="source-icon">{source.icon}</div>
                <div className="source-content">
                  <h3 className="source-title">{source.title}</h3>
                  <p className="source-description">{source.description}</p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-link"
                  >
                    Visit Resource →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card">
        <div className="info-box">
          <h3>📚 About These Resources</h3>
          <ul>
            <li>
              <strong>Missouri-Specific Data:</strong> The Missouri Department of Health & Senior
              Services provides interactive maps and data portals with residential radon test results
              specific to Missouri locations.
            </li>
            <li>
              <strong>Free Test Kits:</strong> You can request a free radon test kit from the Missouri
              Radon Program to test your home.
            </li>
            <li>
              <strong>EPA Action Level:</strong> The EPA recommends taking action when radon levels
              exceed 4.0 pCi/L. The EPA estimates radon causes 21,000 deaths per year and is the
              second leading cause of lung cancer in the United States.
            </li>
            <li>
              <strong>Verified Information:</strong> All resources listed are from official government
              agencies, established health organizations, and reputable research institutions.
            </li>
            <li>
              <strong>Contact:</strong> For questions about Missouri radon data, contact the
              Environmental Public Health Tracking Program at (573) 751-6102 or (toll-free)
              866-628-9911, or email EPHTN@health.mo.gov.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
