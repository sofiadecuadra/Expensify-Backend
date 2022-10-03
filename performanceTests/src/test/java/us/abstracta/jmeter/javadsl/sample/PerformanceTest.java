package us.abstracta.jmeter.javadsl.sample;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static us.abstracta.jmeter.javadsl.JmeterDsl.*;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import us.abstracta.jmeter.javadsl.core.TestPlanStats;


import static org.assertj.core.api.Assertions.assertThat;
import static us.abstracta.jmeter.javadsl.JmeterDsl.*;
import static us.abstracta.jmeter.javadsl.dashboard.DashboardVisualizer.*;

import java.io.File;
import java.io.IOException;
import java.time.Duration;

import org.apache.commons.io.FileUtils;
import org.apache.jmeter.control.ThroughputController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import us.abstracta.jmeter.javadsl.core.TestPlanStats;

public class PerformanceTest {

  @Test
  public void testCategoriesWithMoreExpenses() throws IOException {
    String reportDir = "./report/testSimple";

    TestPlanStats stats = testPlan(
      rpsThreadGroup()
      .maxThreads(1440)
      .rampTo(20, Duration.ofSeconds(1,2))
      .rampToAndHold(20, Duration.ofSeconds(1), Duration.ofSeconds(60))
      .children( httpSampler("https://api.expensify.ml/categories/expenses").header("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImNyZWF0ZWRBdCI6IjIwMjItMTAtMDFUMTM6MDA6MDYuMDI0WiIsIm5hbWUiOiJyb290In0sImlhdCI6MTY2NDYyOTIwNn0.RfnVSgPNFD5w_olsG5b8GJhIWlSaJogVKWP0GvlTm94")),
      
          
        dashboardVisualizer(),
        htmlReporter(reportDir)).run();
        long miliseconds=stats.overall().sampleTime().perc95().toMillis();
        long expected=Long.parseLong("300");
        assertTrue(miliseconds<=expected);
    

  } 
  // @Test
  // public void testCategories() throws IOException {
  //   String reportDir = "./report/testSimple";

  //   TestPlanStats stats = testPlan(
  //       threadGroup(
  //           2,
  //           2,
  //           httpSampler("https://api.expensify.ml/categories/expenses"),
  //           uniformRandomTimer(500, 2000)),
  //       dashboardVisualizer(),
  //       htmlReporter(reportDir)).run();
  //       long miliseconds=stats.overall().sampleTime().perc95().toMillis();
  //       long expected=Long.parseLong("300");
  //       assertTrue(miliseconds<=expected);
    

  // }
}
