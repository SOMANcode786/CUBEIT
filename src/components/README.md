  <section ref={systemRef} id="services" className={styles.systemSection}>
          <div className={styles.systemSticky}>
            <div className={styles.systemBackdrop} aria-hidden="true" />
            <SceneLayer
              mode="system"
              progress={systemProgress}
              velocity={systemVelocity}
              pointer={pointer}
              active={systemActive}
              reducedMotion={reducedMotion}
            />

            <header className={styles.systemHeader} data-cubeiq-system-intro>
              <span>THE CUBEIQ SYSTEM</span>
              <p>Most agencies stop at the ad. We connect what happens next.</p>
            </header>

            <div className={styles.stageRail} aria-hidden="true">
              {GROWTH_STAGES.map((stage) => (
                <span key={stage.id}>{stage.title}</span>
              ))}
            </div>

            <div className={styles.stageViewport}>
              {GROWTH_STAGES.map((stage, index) => (
                <article
                  className={styles.stage}
                  key={stage.id}
                  data-cubeiq-stage={index}
                  aria-label={`${stage.title}: ${stage.statement}`}
                >
                  <div className={styles.stageNumber}>{stage.number}</div>
                  <h2>{stage.title}</h2>
                  <p>{stage.statement}</p>
                  <div className={styles.stageServices}>{stage.services}</div>
                </article>
              ))}
            </div>

            <div className={styles.systemFooterLine} aria-hidden="true">
              <span>Attract</span>
              <i />
              <span>Scale</span>
            </div>
          </div>
        </section>