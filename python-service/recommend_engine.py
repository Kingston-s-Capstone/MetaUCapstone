import os
from dotenv import load_dotenv
import psycopg2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from builtins import zip
from nltk.corpus import wordnet as wn
import re
from nltk.corpus import stopwords

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

# expand a word with its synonyms from WordNet
def get_synonyms(word):
    synonyms = set()
    for syn in wn.synsets(word):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name().lower().replace('_', ' '))
    return synonyms

#filter out common words from keywords
common_stopwords = set(stopwords.words('english')) | {"&", "/"}

def clean_keywords(text):
    words = re.findall(r'\b[a-z]+\b', text.lower())
    return [word for word in words if word not in common_stopwords]

# Recommendation algorithm
def get_recommendations(user_id):
    user = get_user_profile(user_id)
    if not user:
        return {"error:": "User profile not found"}
    
    internships, scholarships = get_all_opportunities()

    #format user profile into a string
    #adding weights by repeating features (simulates priority in TF-IDF)
    internship_profile = " ".join([
        (user["career_interests"] + "") * 3 if user["career_interests"] else "",
        (user["major"] + "") * 2 if user["major"] else "",
        # (user["location_preferences"] + "") * 1 if user["location_preferences"] else "",
        (user["classification"] + "") * 1 if user["classification"] else ""
    ])

    scholarship_profile = " ".join([
        (user["major"] + "") * 3 if user["major"] else "",
        (user["classification"] + "") * 2 if user["classification"] else "",
        (user["career_interests"] + "") * 2 if user["classification"] else "",
        (user["location_preferences"] + "") * 1 if user["major"] else ""
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
    internship_matrix = vectorizer.fit_transform([internship_profile] + internship_docs)
    scholarship_matrix = vectorizer.fit_transform([scholarship_profile] + scholarship_docs)

    user_internship_vector = internship_matrix[0]
    internship_vectors = internship_matrix[1:]
    internship_scores_list = cosine_similarity(user_internship_vector, internship_vectors).flatten()

    user_scholarship_vector =  scholarship_matrix[0]
    scholarship_vectors = scholarship_matrix[1:]
    scholarship_scores_list = cosine_similarity(user_scholarship_vector, scholarship_vectors).flatten()

    #key word match bonus
    internship = "internship"
    scholarship = "scholarship"

    def apply_keyword_bonus(scores, docs, user, type):
        bonus_list = []
        if type == internship:
            keywords_raw = set(
                (user.get("major","") + " " + user.get("career_interests", "")).lower().split()
            )
            cleaned_keywords = set(clean_keywords(" ".join(keywords_raw)))
        elif type == scholarship:
            keywords_raw = set(
                (user.get("major", "") + " " + user.get("classification", "")).lower().split()
            )
            cleaned_keywords = set(clean_keywords(" ".join(keywords_raw)))
        else:
            keywords_raw = set()

        keywords = set()
        for word in cleaned_keywords:
            keywords.add(word)
            keywords.update(get_synonyms(word))

        for i, doc in enumerate(docs):
            doc_words = set(doc.lower().split())
            matches = keywords & doc_words
            bonus = (len(matches) * 0.05)
            bonus_list.append(bonus)
        return [s + b for s, b in zip(scores, bonus_list)]
    
    internship_scores = apply_keyword_bonus(internship_scores_list, internship_docs, user, internship)
    scholarship_scores = apply_keyword_bonus(scholarship_scores_list, scholarship_docs, user, scholarship)

    top_internships = sorted(
        zip(internship_meta, internship_scores), key=lambda x: x[1], reverse=True
    )[:20]

    top_scholarships = sorted(
        zip(scholarship_meta, scholarship_scores), key=lambda x: x[1], reverse=True
    )[:10]

    return {
        "user": user,
        "internship_ids": [i[0] for i in top_internships],
        "scholarship_ids": [s[0] for s in top_scholarships]
    }

