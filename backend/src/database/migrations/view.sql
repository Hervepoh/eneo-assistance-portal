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