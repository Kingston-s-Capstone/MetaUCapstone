
const ProfDevCard = ({ opp }) => {
    console.log(opp)
    return (
        <div className="opportunity">
                    <div className="opportunityContent">
                        <a href={opp.url} target="_blank" rel="noreffer">{opp.title}</a>
                        <span>{opp.date}</span>
                        <span><strong>Description:</strong>{opp.description}</span>
                    </div>
                </div>
    )
}

export default ProfDevCard