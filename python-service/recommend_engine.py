import os
from dotenv import load_dotenv
import psycopg2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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
    if not user:
        return {"error:": "User profile not found"}
    
    internships, scholarships = get_all_opportunities()

    #format user profile into a string
    user_string = " ".join([
        user["major"] or "",
        user["classification"] or "",
        user["career_interests"] or "",
        user["location_preferences"] or ""
    ])

    #process internships
    internship_docs = []
    internship_meta = []

    for opp in internships:
        text = " ".join([
            opp[1] or "",
            str(opp[2]) if opp[2] else ""
        ])
        internship_docs.append(text)
        internship_meta.append(opp[0])

    #process scholarships
    scholarship_docs = []
    scholarship_meta = []

    for opp in scholarships:
        text = " ".join([
            opp[1] or "",
            opp[2] or "",
            opp[3] or ""
        ])
        scholarship_docs.append(text)
        scholarship_meta.append(opp[0])

    #TF-IDF + cosine similarity
    vectorizer = TfidfVectorizer()
    all_docs = [user_string] + internship_docs + scholarship_docs
    tfidf_matrix = vectorizer.fit_transform(all_docs)

    user_vector = tfidf_matrix[0]
    internship_vectors = tfidf_matrix[1:1+len(internship_docs)]
    scholarship_vectors = tfidf_matrix[1:1+len(scholarship_docs):]

    internship_scores = cosine_similarity(user_vector, internship_vectors).flatten()
    scholarship_scores = cosine_similarity(user_vector, scholarship_vectors).flatten()
    
    top_internships = sorted(
        zip(internship_meta, internship_scores), key=lambda x: x[1], reverse=True
    )[:10]

    top_scholarships = sorted(
        zip(scholarship_meta, scholarship_scores), key=lambda x: x[1], reverse=True
    )[:10]
    return {
        "user": user,
        "internship_ids": [i[0] for i in top_internships],
        "scholarship_ids": [s[0] for s in top_scholarships]
    }

