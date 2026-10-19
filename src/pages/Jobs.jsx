import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsData, categoriesList } from '../data/jobs';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import { RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const Jobs = ({ onApplyJob }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam && categoriesList.includes(categoryParam) ? categoryParam : 'All'
  );
  const [selectedWorkType, setSelectedWorkType] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  // Backend Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(jobsData.length);
  const [jobs, setJobs] = useState(jobsData);
  const [isLoading, setIsLoading] = useState(false);

  // Sync category param if url changes
  useEffect(() => {
    if (categoryParam && categoriesList.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
      setPage(1);
    }
  }, [categoryParam]);

  // Fetch jobs from backend API whenever filters, search, sort, or page change
  useEffect(() => {
    let isCancelled = false;

    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const res = await api.jobs.getAll({
          search: searchTerm,
          category: selectedCategory,
          workType: selectedWorkType,
          sort: sortBy,
          page,
          limit
        });

        if (!isCancelled && res?.data) {
          setJobs(res.data);
          setTotalPages(res.totalPages || 1);
          setTotalJobs(res.total || res.data.length);
        }
      } catch (err) {
        console.warn('Could not fetch from backend, using local state:', err.message);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchJobs, 250); // Debounce search
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, selectedWorkType, sortBy, page, limit]);

  // Compute category counts
  const countsByCategory = useMemo(() => {
    const counts = { All: totalJobs };
    categoriesList.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = jobs.filter((job) => job?.category === cat).length;
      }
    });
    return counts;
  }, [totalJobs, jobs]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setPage(1);
    if (category === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedWorkType('All');
    setSortBy('featured');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="page-wrapper jobs-page">
      {/* Page Header */}
      <section className="jobs-header-section">
        <div className="container">
          <div className="jobs-header-content">
            <span className="section-eyebrow">Verified Listings</span>
            <h1 className="jobs-page-title">Internship Opportunities</h1>
            <p className="jobs-page-subtitle">
              Explore opportunities that match your skills and career goals. All internships include verified mentorship and stipends.
            </p>
          </div>

          {/* Search Bar */}
          <div className="jobs-search-section">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={(val) => {
                setSearchTerm(val);
                setPage(1);
              }} 
              onClear={() => {
                setSearchTerm('');
                setPage(1);
              }} 
              placeholder="Search internships by role, technology (e.g. React, Python), or company..."
            />
          </div>

          {/* Category Filter Pills */}
          <div className="jobs-filter-section">
            <FilterBar 
              categories={categoriesList} 
              selectedCategory={selectedCategory} 
              onSelectCategory={handleSelectCategory}
              countsByCategory={countsByCategory}
            />
          </div>
        </div>
      </section>

      {/* Main Listing Section */}
      <section className="jobs-listing-section">
        <div className="container">
          {/* Controls Bar */}
          <div className="listing-controls-bar">
            <div className="listing-results-count">
              <span>Showing <strong>{jobs.length}</strong> of {totalJobs} opportunities</span>
              {selectedCategory !== 'All' && (
                <span className="active-filter-badge">
                  Category: {selectedCategory}
                </span>
              )}
              {searchTerm && (
                <span className="active-filter-badge">
                  Search: "{searchTerm}"
                </span>
              )}
            </div>

            <div className="listing-quick-filters">
              {/* Work Type Filter */}
              <div className="quick-filter-group">
                <span className="filter-label">Mode:</span>
                <div className="work-type-buttons">
                  {['All', 'Remote', 'Hybrid'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`work-type-btn ${selectedWorkType === type ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedWorkType(type);
                        setPage(1);
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div className="sort-dropdown-wrap">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="sort-select"
                  aria-label="Sort internships"
                >
                  <option value="featured">Featured / Default</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="deadline">Upcoming Deadline</option>
                  <option value="stipend-high">Highest Stipend</option>
                </select>
              </div>

              {(searchTerm || selectedCategory !== 'All' || selectedWorkType !== 'All') && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm clear-filters-btn"
                  onClick={handleClearFilters}
                >
                  <RefreshCw size={13} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid or Empty State */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 0', color: '#64748b' }}>
              <Loader2 size={32} className="spin-icon" style={{ animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
              <p>Fetching opportunities from database...</p>
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="job-cards-grid">
                {jobs.map((job) => (
                  <JobCard 
                    key={job._id || job.id} 
                    job={job} 
                    onApply={onApplyJob} 
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div 
                  className="pagination-controls" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginTop: '2.5rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e2e8f0'
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                    Page {page} of {totalPages}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-results-card">
              <AlertCircle size={40} className="empty-icon text-muted" />
              <h3 className="empty-title">No internships matched your criteria</h3>
              <p className="empty-desc">
                We couldn't find any opportunities matching "<strong>{searchTerm || selectedCategory}</strong>". Try clearing your filters or searching for broader keywords like "Web", "Python", or "Design".
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClearFilters}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Jobs;
