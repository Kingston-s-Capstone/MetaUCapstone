
const ProfDevCard = ({ opp }) => {
    
    return (
        <div className="opportunity">
                    <div className="opportunityContent">
                        <a href={opp.url} target="_blank" rel="noreffer">{opp.title}</a>
                        <span><strong>{opp.organization}</strong> | {new Date(opp.date).toLocaleDateString("en-US")}</span>
                        <span><strong>Description:</strong>{opp.description}</span>
                    </div>
                </div>
    )
}

export default ProfDevCard