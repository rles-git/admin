
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  MessageSquareText,
  Star,
  CircleAlert,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

type Review = {
  id: number;
  station_id: string;
  station_name: string;
  station_short_name: string | null;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

type Station = {
  id: string | number;
  name: string;
};

export default function StationReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stationFilter, setStationFilter] = useState("All stations");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [reviewsResponse, stationsResponse] = await Promise.all([
        fetch("/api/reviews", { cache: "no-store" }),
        fetch("/api/stations", { cache: "no-store" }),
      ]);

      if (!reviewsResponse.ok) {
        throw new Error("Failed to load reviews.");
      }

      if (!stationsResponse.ok) {
        throw new Error("Failed to load stations.");
      }

      const [reviewsData, stationsData] = await Promise.all([
        reviewsResponse.json(),
        stationsResponse.json(),
      ]);

      if (!Array.isArray(reviewsData) || !Array.isArray(stationsData)) {
        throw new Error("Unexpected API response.");
      }

      setReviews(reviewsData);
      setStations(stationsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load review records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter(
      (review) =>
        stationFilter === "All stations" ||
        review.station_id === stationFilter
    );
  }, [reviews, stationFilter]);

  const stats = useMemo(() => {
    const total = filteredReviews.length;

    const average = total
      ? filteredReviews.reduce(
          (sum, review) => sum + Number(review.rating),
          0
        ) / total
      : 0;

    const fiveStar = filteredReviews.filter(
      (review) => Number(review.rating) === 5
    ).length;

    const reviewedStations = new Set(
      filteredReviews.map((review) => review.station_id)
    ).size;

    return {
      total,
      average,
      fiveStar,
      reviewedStations,
    };
  }, [filteredReviews]);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = filteredReviews.filter(
      (review) => Number(review.rating) === rating
    ).length;

    return {
      rating,
      count,
      percentage: stats.total
        ? (count / stats.total) * 100
        : 0,
    };
  });

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Station Reviews</h1>
          <p>
            Monitor customer feedback, ratings and satisfaction
            across your charging network.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="outline-button"
            disabled={refreshing || loading}
            onClick={() => {
              setRefreshing(true);
              void loadData();
            }}
          >
            <RefreshCw size={14} />
            Refresh data
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <ReviewMetric
          title="Total reviews"
          value={loading ? "—" : String(stats.total)}
          sub="Customer feedback records"
        />

        <ReviewMetric
          title="Average rating"
          value={loading ? "—" : `${stats.average.toFixed(2)} / 5`}
          sub="Average customer rating"
        />

        <ReviewMetric
          title="5-star reviews"
          value={loading ? "—" : String(stats.fiveStar)}
          sub="Highest-rated feedback"
        />

        <ReviewMetric
          title="Stations reviewed"
          value={loading ? "—" : String(stats.reviewedStations)}
          sub="Stations with feedback"
        />
      </div>

      <section className="panel inventory-panel">
        <div className="panel-head">
          <h3>Customer feedback</h3>
          <span>Live data from public.reviews</span>
        </div>

        <div className="toolbar">
          <label className="select-wrap">
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
            >
              <option value="All stations">All stations</option>

              {stations.map((station) => (
                <option
                  key={String(station.id)}
                  value={String(station.id)}
                >
                  {station.id} · {station.name}
                </option>
              ))}
            </select>

            <ChevronDown size={13} />
          </label>

          <div className="toolbar-spacer" />

          <span className="muted tiny">
            {filteredReviews.length} reviews
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            <Activity size={20} />
            Loading reviews from database...
          </div>
        ) : error ? (
          <div className="empty-state">
            <CircleAlert size={22} />
            <strong>Could not load reviews</strong>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="review-rating-breakdown">
              <div className="review-breakdown-heading">
                <div>
                  <strong>{stats.average.toFixed(2)}</strong>
                  <div className="review-large-stars">
                    {"★".repeat(Math.round(stats.average))}
                    <span>
                      {"★".repeat(5 - Math.round(stats.average))}
                    </span>
                  </div>
                  <small>Based on {stats.total} reviews</small>
                </div>
              </div>

              <div className="review-breakdown-bars">
                {ratingBreakdown.map((item) => (
                  <div className="review-rating-row" key={item.rating}>
                    <span>{item.rating} ★</span>

                    <div className="progress-track">
                      <i
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>

                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>REVIEW ID</th>
                    <th>STATION</th>
                    <th>USER ID</th>
                    <th>RATING</th>
                    <th>COMMENT</th>
                    <th>SUBMITTED</th>
                    <th>UPDATED</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <strong>#{review.id}</strong>
                      </td>

                      <td>
                        <strong>{review.station_name}</strong>
                        <small
                          className="muted"
                          style={{ display: "block" }}
                        >
                          {review.station_id}
                        </small>
                      </td>

                      <td>{review.user_id}</td>

                      <td>
                        <div className="review-stars">
                          {"★".repeat(Number(review.rating))}
                          <span>
                            {"★".repeat(5 - Number(review.rating))}
                          </span>
                        </div>
                        <small className="muted">
                          {review.rating}/5
                        </small>
                      </td>

                      <td className="review-comment">
                        {review.comment || "No comment"}
                      </td>

                      <td>
                        {new Date(review.created_at).toLocaleString()}
                      </td>

                      <td>
                        {new Date(review.updated_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredReviews.length === 0 && (
                <div className="empty-state">
                  <MessageSquareText size={22} />
                  <strong>No reviews found</strong>
                  <p>
                    No reviews are available for the selected station.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="table-foot">
          {loading
            ? "Loading review records..."
            : error
            ? "Review data unavailable"
            : `Showing ${filteredReviews.length} reviews`}
        </div>
      </section>

      <footer>
        Be-Electric · Qatar network / Customer feedback
      </footer>
    </div>
  );
}

function ReviewMetric({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <section className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </section>
  );
}
