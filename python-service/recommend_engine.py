import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

#connect to db
def connect_db():
    db_url = os.getenv("SUPABASE_DB_URL")
    return psycopg2.connect(db_url)

#get user profile
def get_user_profile(user_id):
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT major, classification, career_interests, location_preferences
        FROM profiles
        WHERE user_id = %s
    """, (user_id,))
    row = cur.fetchone()

    cur.close()
    conn.close()

    if row:
        return {
            "major": row[0],
            "classification": row[1],
            "career_interests": row[2],
            "location_preferences": row[3]
        }
    return None

#get internships and scholarships
def get_all_opportunities():
    conn = connect_db()
    cur = conn.cursor()

    #internships
    cur.execute("SELECT id, title, locations_derived FROM internships")
    internships = cur.fetchall()

    #Scholarships
    cur.execute("SELECT id, description, eligibility, location FROM scholarships")
    scholarships = cur.fetchall()

    cur.close()
    conn.close()

    return internships, scholarships

def get_recommendations(user_id):
    user = get_user_profile(user_id)
    internships, scholarships = get_all_opportunities()

    return {
        "user": user,
        "internships_sample": internships[:2],
        "scholarships_sample": scholarships[:2]
    }