package us.abstracta.jmeter.javadsl.sample;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static us.abstracta.jmeter.javadsl.JmeterDsl.*;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.time.Instant;
import java.util.Properties;

import org.junit.jupiter.api.Test;
import us.abstracta.jmeter.javadsl.core.TestPlanStats;


import static org.assertj.core.api.Assertions.assertThat;
import static us.abstracta.jmeter.javadsl.JmeterDsl.*;
import static us.abstracta.jmeter.javadsl.dashboard.DashboardVisualizer.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.time.Duration;

import org.apache.commons.io.FileUtils;
import org.apache.jmeter.control.ThroughputController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import us.abstracta.jmeter.javadsl.core.TestPlanStats;
public class PerformanceTest {
  @Test
  public void testCategories() throws IOException {
      String reportDir=Env.reportDir;
      String authorizationHeader=Env.authorizationHeader;
      String endPointCategories=Env.endpointCategories;
      String apiKey=Env.apiKey;
      String miliSecondsExpected=Env.miliSecondsExpected;

      TestPlanStats stats = testPlan(
      rpsThreadGroup()
      .maxThreads(1250)
      .rampTo(21, Duration.ofSeconds(1,2))
      .rampToAndHold(21, Duration.ofSeconds(1), Duration.ofSeconds(60))
      .children( httpSampler
      (endPointCategories).
      header(authorizationHeader, apiKey)),
      
          
        dashboardVisualizer(),
        htmlReporter(reportDir)).run();
        long miliseconds=stats.overall().sampleTime().perc95().toMillis();
        long expected=Long.parseLong(miliSecondsExpected);
        assertTrue(miliseconds<=expected);
    

    

  }

  @Test
  public void testCategoriesWithMoreExpenses() throws IOException {
    String reportDir = Env.reportDir;
    String authorizationHeader = Env.authorizationHeader;
    String apiKey=Env.apiKey;
    String endPointCategoriesExpenses=Env.endpointCategoriesExpenses;
    String miliSecondsExpected=Env.miliSecondsExpected;

    TestPlanStats stats = testPlan(
      rpsThreadGroup()
      .maxThreads(1250)
      .rampTo(21, Duration.ofSeconds(1,2))
      .rampToAndHold(21, Duration.ofSeconds(1), Duration.ofSeconds(60))
      .children( httpSampler(endPointCategoriesExpenses).header(authorizationHeader, apiKey)),
      
          
        dashboardVisualizer(),
        htmlReporter(reportDir)).run();
        long miliseconds=stats.overall().sampleTime().perc95().toMillis();
        long expected=Long.parseLong(miliSecondsExpected);
        assertTrue(miliseconds<=expected);
    

  } 
  
}
