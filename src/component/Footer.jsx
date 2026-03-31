import './Footer.css';

const Footer = ({nameQuiz}) => {
    return (<div className="maturazinformatyki-quiz-footer">
            <p className="maturazinformatyki-quiz-footer-p">
                maturazinformatyki.it
                <span className='maturazinformatyki-quiz-footer-yellow'>{nameQuiz}</span>
            </p>
        </div>)
}

export default Footer;