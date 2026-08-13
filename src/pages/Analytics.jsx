
import React, {
  useEffect,
  useState
} from 'react';

import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError('');

        const data =
          await api.get(
            '/analytics/dashboard?role=ADMIN'
          );

        setStats(data);
      } catch (err) {
        console.error(
          'Failed to load analytics:',
          err
        );

        setError(
          err.message ||
          'Failed to load analytics.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar
          title="Hospital Analytics & Performance"
          subtitle="System-wide metrics and appointment breakdowns"
        />

        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem',
            color:
              'var(--color-text-muted)'
          }}
        >
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar
          title="Hospital Analytics & Performance"
          subtitle="System-wide metrics and appointment breakdowns"
        />

        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca'
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  const cancelled =
    stats?.cancelledAppointments || 0;

  const noShows =
    stats?.noShowAppointments || 0;

  const cancelledAndNoShows =
    cancelled + noShows;

  return (
    <div>
      <Navbar
        title="Hospital Analytics & Performance"
        subtitle="System-wide metrics and appointment breakdowns"
      />

      {/* ============================================================
          STAT CARDS
      ============================================================ */}

      <div
        className="stats-grid"
        style={{
          marginBottom: '2rem'
        }}
      >
        <StatCard
          label="Total Appointments"
          value={
            stats?.totalAppointments || 0
          }
          subtext="System total"
        />

        <StatCard
          label="Confirmed Appointments"
          value={
            stats?.confirmedAppointments || 0
          }
          subtext="Verified visits"
        />

        <StatCard
          label="Completed Consultations"
          value={
            stats?.completedAppointments || 0
          }
          subtext="Finished visits"
          subtextColor="positive"
        />

        <StatCard
          label="Cancelled / No Shows"
          value={cancelledAndNoShows}
          subtext="Cancelled and missed visits"
          subtextColor="highlight"
        />
      </div>

      {/* ============================================================
          ADDITIONAL SUMMARY
      ============================================================ */}

      <div
        className="stats-grid"
        style={{
          marginBottom: '2rem'
        }}
      >
        <StatCard
          label="Total Patients"
          value={
            stats?.totalPatients || 0
          }
          subtext="Registered patients"
        />

        <StatCard
          label="Total Doctors"
          value={
            stats?.totalDoctors || 0
          }
          subtext="Registered doctors"
        />

        <StatCard
          label="Today's Appointments"
          value={
            stats?.todayAppointments || 0
          }
          subtext="Scheduled for today"
        />

        <StatCard
          label="Pending Appointments"
          value={
            stats?.pendingAppointments || 0
          }
          subtext="Awaiting confirmation"
        />
      </div>

      {/* ============================================================
          DEPARTMENT CONSULTATION VOLUME
      ============================================================ */}

      <div className="card">
        <h3 className="card-title">
          Department Consultation Volume
        </h3>

        <p
          style={{
            fontSize: '0.85rem',
            color:
              'var(--color-text-muted)',
            marginBottom: '1.5rem'
          }}
        >
          Distribution of appointments
          across clinical departments.
        </p>

        {stats?.departmentAnalytics?.length >
        0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {stats.departmentAnalytics.map(
              department => (
                <div
                  key={department.name}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom:
                        '0.35rem'
                    }}
                  >
                    <span>
                      {department.name}
                    </span>

                    <span>
                      {department.count}{' '}
                      appointments (
                      {department.percentage}
                      %)
                    </span>
                  </div>

                  <div
                    style={{
                      height: '8px',
                      backgroundColor:
                        'var(--color-subtle-bg)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${department.percentage}%`,
                        backgroundColor:
                          'var(--color-primary)',
                        borderRadius: '4px',
                        transition:
                          'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color:
                'var(--color-text-muted)'
            }}
          >
            No appointment data
            available.
          </div>
        )}
      </div>
    </div>
  );
}

