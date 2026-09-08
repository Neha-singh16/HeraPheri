import {
  QueryTypes,
} from "sequelize";

import sequelize from "../config/database.js";

export async function getNearbyTasks({
  executorId,
  latitude,
  longitude,
  radiusKm = 5,
  category,
}) {
  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "Invalid latitude or longitude."
    );
  }

  const radiusMeters =
    Number(radiusKm) * 1000;

  if (
    !Number.isFinite(radiusMeters) ||
    radiusMeters <= 0
  ) {
    throw new Error(
      "Radius must be greater than zero."
    );
  }

  const replacements = {
    executorId,
    latitude: Number(latitude),
    longitude: Number(longitude),
    radiusMeters,
  };

  let categoryCondition = "";

  if (category) {
    categoryCondition =
      "AND t.category = :category";

    replacements.category = category;
  }

  const tasks = await sequelize.query(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.category,
        t.task_mode,
        t.reward_amount,
        t.currency,
        t.deadline_at,
        t.risk_level,
        t.proof_type,
        t.status,
        t.address_text,

        ST_Distance_Sphere(
          ST_SRID(t.location, 4326),
          ST_SRID(
            POINT(
              :longitude,
              :latitude
            ),
            4326
          )
        ) AS distance_meters

      FROM tasks t

      WHERE t.status = 'OPEN'

        -- The requester should not see their own task
        -- as a task they can execute.
        AND t.requester_id != :executorId

        -- Digital tasks don't require physical presence.
        AND t.location IS NOT NULL

        ${categoryCondition}

        AND ST_Distance_Sphere(
          ST_SRID(t.location, 4326),
          ST_SRID(
            POINT(
              :longitude,
              :latitude
            ),
            4326
          )
        ) <= :radiusMeters

      ORDER BY distance_meters ASC

      LIMIT 50;
    `,
    {
      replacements,
      type: QueryTypes.SELECT,
    }
  );

  return tasks;
}