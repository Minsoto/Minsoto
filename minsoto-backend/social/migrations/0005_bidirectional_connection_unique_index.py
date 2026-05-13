from django.db import migrations


class Migration(migrations.Migration):
    """
    Adds a DB-level unique index to prevent duplicate bidirectional connections.
    The Connection model comment explicitly noted this constraint was missing at
    the DB level — it only existed in application logic, making it race-condition-prone.

    LEAST/GREATEST normalizes the pair so (A, B) and (B, A) are treated as the same.
    """

    dependencies = [
        ('social', '0004_profile_display_name_profile_show_avatar_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_connection_pair
            ON social_connection(
                LEAST(from_user_id, to_user_id),
                GREATEST(from_user_id, to_user_id)
            );
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_unique_connection_pair;"
        )
    ]
