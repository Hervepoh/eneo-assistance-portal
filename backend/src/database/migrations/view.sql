CREATE
OR REPLACE VIEW sessions_user_roles_permissions AS
SELECT
    s.id,
    s.user_id,
    s.role_id,
    r.name AS role_name,
    p.id AS permission_id,
    p.name AS permission_name
FROM
    sessions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN roles r ON s.role_id = r.id
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    LEFT JOIN permissions p ON rp.permission_id = p.id;




CREATE OR REPLACE VIEW assistance_requests_view AS
SELECT
    ar.id,
    r.id AS region_id,
    r.name AS region_name,
    d.id AS delegation_id,
    d.name AS delegation_name,
    a.id AS agence_id,
    a.name AS agence_name,
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    su.id AS superior_user_id,
    su.name AS superior_user_name,
    ar.titre,
    ar.description,
    ar.status,
    ag.id AS application_group_id,
    ag.name AS application_group_name,
    app.id AS application_id,
    app.name AS application_name,
    ar.created_at,
    ar.updated_at,
    (
        SELECT COUNT(af.id)
        FROM assistance_files af 
        WHERE af.assistance_request_id = ar.id
    ) AS fichier_count
FROM assistance_requests ar
-- Région -> Délégation -> Agence
JOIN agences a ON ar.agence_id = a.id
JOIN delegations d ON a.delegation_id = d.id
JOIN regions r ON d.region_id = r.id
-- Utilisateur demandeur
JOIN users u ON ar.user_id = u.id
-- Supérieur hiérarchique
JOIN users su ON ar.superior_user_id = su.id
-- Applications et groupes
JOIN applications app ON ar.application_id = app.id
JOIN application_groups ag ON app.group_id = ag.id;
